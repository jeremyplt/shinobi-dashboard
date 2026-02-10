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
 * Convert currency amount to USD cents
 * Rates are approximate USD value per 1 unit of currency × 100 (to get cents)
 * e.g., 1 EUR ≈ 1.10 USD → rate = 110 cents per EUR
 */
function convertToUsdCents(amount: number, currency: string): number {
  // Cents per 1 unit of the currency
  const centsPerUnit: Record<string, number> = {
    USD: 100,
    EUR: 110,
    GBP: 127,
    CAD: 73,
    AUD: 65,
    NZD: 60,
    CHF: 113,
    // Asian
    JPY: 0.67,     // 1 JPY = $0.0067
    KRW: 0.075,    // 1 KRW = $0.00075
    CNY: 14,       // 1 CNY = $0.14
    INR: 1.2,      // 1 INR = $0.012
    IDR: 0.0063,   // 1 IDR = $0.000063
    PHP: 1.8,      // 1 PHP = $0.018
    THB: 2.9,      // 1 THB = $0.029
    VND: 0.004,    // 1 VND = $0.00004
    MYR: 23,       // 1 MYR = $0.23
    SGD: 75,       // 1 SGD = $0.75
    TWD: 3.1,      // 1 TWD = $0.031
    // Americas
    BRL: 18,       // 1 BRL = $0.18
    MXN: 5,        // 1 MXN = $0.05
    COP: 0.023,    // 1 COP = $0.00023
    ARS: 0.09,     // 1 ARS = $0.0009
    CLP: 0.1,      // 1 CLP = $0.001
    PEN: 27,       // 1 PEN = $0.27
    // Europe (non-EUR)
    SEK: 9.5,      // 1 SEK = $0.095
    NOK: 9.3,      // 1 NOK = $0.093
    DKK: 14.7,     // 1 DKK = $0.147
    PLN: 24,       // 1 PLN = $0.24
    CZK: 4.3,      // 1 CZK = $0.043
    HUF: 0.27,     // 1 HUF = $0.0027
    RON: 22,       // 1 RON = $0.22
    BGN: 56,       // 1 BGN = $0.56
    HRK: 14.5,     // 1 HRK = $0.145
    // Middle East / Africa
    TRY: 3,        // 1 TRY = $0.03
    ZAR: 5.5,      // 1 ZAR = $0.055
    AED: 27,       // 1 AED = $0.27
    SAR: 27,       // 1 SAR = $0.27
    ILS: 28,       // 1 ILS = $0.28
    EGP: 2,        // 1 EGP = $0.02
    NGN: 0.065,    // 1 NGN = $0.00065
    // CIS
    RUB: 1.1,      // 1 RUB = $0.011
    UAH: 2.4,      // 1 UAH = $0.024
    KZT: 0.21,     // 1 KZT = $0.0021
  };

  const rate = centsPerUnit[currency];
  if (!rate) {
    // Unknown currency: log warning and estimate conservatively
    console.warn(`Unknown currency: ${currency} for amount ${amount}`);
    // If amount > 100, likely a weak currency — convert very conservatively
    if (amount > 1000) return Math.round(amount * 0.01); // assume ~1 cent per 100 units
    if (amount > 100) return Math.round(amount * 0.1);   // assume ~10 cents per 100 units
    return Math.round(amount * 100); // assume USD-like
  }
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
