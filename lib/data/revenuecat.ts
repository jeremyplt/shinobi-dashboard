/**
 * RevenueCat data fetching
 * - Current metrics from RevenueCat API v2
 * - Historical data reconstructed from Firestore revenuecat_events
 */

import { runQuery } from "./firebase-admin";
import { cached } from "./cache";

const REVENUECAT_API_KEY = process.env.REVENUECAT_API_KEY;
const PROJECT_ID = "projc4678a43";

// --- Types ---

export interface RevenueCatOverview {
  mrr: number;
  activeSubscriptions: number;
  revenue28d: number;
  activeUsers28d: number;
  newCustomers28d: number;
  activeTrials: number;
  transactions28d: number;
}

export interface DailyRevenue {
  date: string; // YYYY-MM-DD
  revenue: number; // USD cents
  newSubscriptions: number;
  renewals: number;
  cancellations: number;
  churns: number; // expirations
}

// --- Current Metrics ---

export async function fetchRevenueCatOverview(): Promise<RevenueCatOverview> {
  return cached("revenuecat:overview", async () => {
    if (!REVENUECAT_API_KEY) {
      throw new Error("REVENUECAT_API_KEY not configured");
    }

    const res = await fetch(
      `https://api.revenuecat.com/v2/projects/${PROJECT_ID}/metrics/overview`,
      {
        headers: {
          Authorization: `Bearer ${REVENUECAT_API_KEY}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(`RevenueCat API error: ${res.status}`);
    }

    const data = await res.json();
    const metrics: Record<string, number> = {};

    for (const m of data.metrics || []) {
      metrics[m.id] = m.value || 0;
    }

    return {
      mrr: Math.round(metrics.mrr || 0),
      activeSubscriptions: Math.round(metrics.active_subscriptions || 0),
      revenue28d: Math.round(metrics.revenue || 0),
      activeUsers28d: Math.round(metrics.active_users || 0),
      newCustomers28d: Math.round(metrics.new_customers || 0),
      activeTrials: Math.round(metrics.active_trials || 0),
      transactions28d: Math.round(metrics.num_tx_last_28_days || 0),
    };
  }, 30 * 60 * 1000);
}

// --- Historical Data from Firestore Events ---

/**
 * Fetch all RevenueCat events from Firestore and aggregate into daily data
 */
export async function fetchRevenueHistory(
  startDate?: string,
  endDate?: string
): Promise<DailyRevenue[]> {
  const cacheKey = `revenuecat:history:${startDate || "all"}:${endDate || "now"}`;

  return cached(cacheKey, async () => {
    const where = [];

    if (startDate) {
      where.push({
        field: "event_timestamp_ms",
        op: "GREATER_THAN_OR_EQUAL" as const,
        value: { integerValue: String(new Date(startDate).getTime()) },
      });
    }
    if (endDate) {
      where.push({
        field: "event_timestamp_ms",
        op: "LESS_THAN_OR_EQUAL" as const,
        value: {
          integerValue: String(new Date(endDate + "T23:59:59Z").getTime()),
        },
      });
    }

    const docs = await runQuery({
      collection: "revenuecat_events",
      where: where.length > 0 ? where : undefined,
      orderBy: [{ field: "event_timestamp_ms", direction: "ASCENDING" }],
      select: [
        "type",
        "event_timestamp_ms",
        "price_in_purchased_currency",
        "currency",
      ],
      limit: 50000,
    });

    // Aggregate events by day
    const dailyMap = new Map<string, DailyRevenue>();

    for (const doc of docs) {
      const eventTs = doc.event_timestamp_ms as number;
      const eventType = doc.type as string;
      const price = (doc.price_in_purchased_currency as number) || 0;
      const currency = (doc.currency as string) || "USD";

      const date = new Date(eventTs);
      const dateKey = date.toISOString().split("T")[0];

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          revenue: 0,
          newSubscriptions: 0,
          renewals: 0,
          cancellations: 0,
          churns: 0,
        });
      }

      const day = dailyMap.get(dateKey)!;
      const usdCents = convertToUsdCents(price, currency);

      switch (eventType) {
        case "INITIAL_PURCHASE":
          day.newSubscriptions++;
          day.revenue += usdCents;
          break;
        case "RENEWAL":
          day.renewals++;
          day.revenue += usdCents;
          break;
        case "CANCELLATION":
          day.cancellations++;
          break;
        case "EXPIRATION":
          day.churns++;
          break;
        case "NON_RENEWING_PURCHASE":
          day.revenue += usdCents;
          break;
      }
    }

    const result = Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    if (result.length > 1) {
      return fillMissingDays(result);
    }

    return result;
  }, 60 * 60 * 1000);
}

/**
 * Simple currency conversion to USD cents
 */
function convertToUsdCents(amount: number, currency: string): number {
  const rates: Record<string, number> = {
    USD: 100,
    EUR: 110,
    GBP: 125,
    CAD: 73,
    AUD: 65,
    JPY: 0.67,
    BRL: 18,
    KRW: 0.075,
    CNY: 14,
    MXN: 5,
    SEK: 9.5,
    PLN: 24,
    NZD: 60,
    HUF: 0.27,
    INR: 1.2,
  };

  const rate = rates[currency];
  if (!rate) return Math.round(amount * 100);
  return Math.round(amount * rate);
}

/**
 * Fill missing days between the first and last date
 */
function fillMissingDays(data: DailyRevenue[]): DailyRevenue[] {
  if (data.length === 0) return data;

  const result: DailyRevenue[] = [];
  const start = new Date(data[0].date);
  const end = new Date(data[data.length - 1].date);
  const dataMap = new Map(data.map((d) => [d.date, d]));

  const current = new Date(start);
  while (current <= end) {
    const dateKey = current.toISOString().split("T")[0];
    result.push(
      dataMap.get(dateKey) || {
        date: dateKey,
        revenue: 0,
        newSubscriptions: 0,
        renewals: 0,
        cancellations: 0,
        churns: 0,
      }
    );
    current.setDate(current.getDate() + 1);
  }

  return result;
}
