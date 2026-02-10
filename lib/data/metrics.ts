/**
 * Advanced metrics calculations
 * - MRR Evolution (cumulative MRR over time)
 * - Churn Rate (% of subscribers who churned)
 * - Conversion Rate (trial → paid)
 */

import { runQuery } from "./firebase-admin";
import { cached } from "./cache";

export interface MRRDataPoint {
  date: string; // YYYY-MM-DD
  mrr: number; // USD cents
  subscribers: number;
}

export interface ChurnDataPoint {
  date: string; // YYYY-MM-DD
  churnRate: number; // percentage
  churned: number;
  activeStart: number;
}

export interface ConversionDataPoint {
  date: string; // YYYY-MM-DD
  conversionRate: number; // percentage
  trialsStarted: number;
  trialsConverted: number;
}

// Typical monthly subscription prices in USD cents
const SUBSCRIPTION_PRICES: Record<string, number> = {
  "monthly": 799,    // $7.99
  "yearly": 3999,    // $39.99 (paid yearly, MRR = 39.99/12 = ~333/mo)
  "lifetime": 0,     // doesn't contribute to MRR
};

/**
 * Calculate MRR evolution over time from subscription events
 * MRR = sum of monthly recurring revenue from active subscriptions
 */
export async function fetchMRREvolution(
  startDate?: string,
  endDate?: string
): Promise<MRRDataPoint[]> {
  const cacheKey = `metrics:mrr:${startDate || "all"}:${endDate || "now"}`;

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
        "product_id",
        "price_in_purchased_currency",
        "currency",
        "expiration_at_ms",
        "app_user_id",
      ],
      limit: 50000,
    });

    // Track active subscriptions and calculate MRR day by day
    interface Subscription {
      userId: string;
      productId: string;
      startDate: string;
      expirationMs: number;
      monthlyValue: number; // USD cents
    }

    const activeSubscriptions = new Map<string, Subscription>();
    const dailyMRR = new Map<string, { mrr: number; subscribers: number }>();

    for (const doc of docs) {
      const eventTs = doc.event_timestamp_ms as number;
      const eventType = doc.type as string;
      const userId = doc.app_user_id as string;
      const productId = (doc.product_id as string) || "";
      const expirationMs = (doc.expiration_at_ms as number) || 0;
      const price = (doc.price_in_purchased_currency as number) || 0;
      const currency = (doc.currency as string) || "USD";

      const dateKey = new Date(eventTs).toISOString().split("T")[0];

      // Determine monthly value
      let monthlyValue = 0;
      if (productId.includes("monthly")) {
        monthlyValue = convertToUsdCents(price, currency);
      } else if (productId.includes("yearly") || productId.includes("annual")) {
        // Annual subscription: divide by 12 for MRR
        monthlyValue = Math.round(convertToUsdCents(price, currency) / 12);
      }

      switch (eventType) {
        case "INITIAL_PURCHASE":
        case "RENEWAL":
          // Add or update subscription
          activeSubscriptions.set(userId, {
            userId,
            productId,
            startDate: dateKey,
            expirationMs,
            monthlyValue,
          });
          break;
        case "EXPIRATION":
        case "CANCELLATION":
          // Remove subscription
          activeSubscriptions.delete(userId);
          break;
      }

      // Calculate total MRR for this day
      let totalMRR = 0;
      let subscriberCount = 0;

      for (const sub of activeSubscriptions.values()) {
        // Only count if subscription is still active
        if (sub.expirationMs > eventTs) {
          totalMRR += sub.monthlyValue;
          subscriberCount++;
        }
      }

      dailyMRR.set(dateKey, { mrr: totalMRR, subscribers: subscriberCount });
    }

    const result: MRRDataPoint[] = Array.from(dailyMRR.entries())
      .map(([date, data]) => ({
        date,
        mrr: data.mrr,
        subscribers: data.subscribers,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (result.length > 1) {
      return fillMissingDays(result, startDate, endDate);
    }

    return result;
  }, 60 * 60 * 1000);
}

/**
 * Calculate churn rate over time
 * Churn Rate = churned subscribers / active subscribers at start of period
 */
export async function fetchChurnRate(
  startDate?: string,
  endDate?: string,
  period: "weekly" | "monthly" = "weekly"
): Promise<ChurnDataPoint[]> {
  const cacheKey = `metrics:churn:${period}:${startDate || "all"}:${endDate || "now"}`;

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
      select: ["type", "event_timestamp_ms", "app_user_id"],
      limit: 50000,
    });

    // Track subscribers by period
    interface PeriodData {
      date: string;
      activeStart: Set<string>;
      churned: Set<string>;
    }

    const periods = new Map<string, PeriodData>();

    for (const doc of docs) {
      const eventTs = doc.event_timestamp_ms as number;
      const eventType = doc.type as string;
      const userId = doc.app_user_id as string;

      const date = new Date(eventTs);
      const periodKey = getPeriodKey(date, period);

      if (!periods.has(periodKey)) {
        periods.set(periodKey, {
          date: periodKey,
          activeStart: new Set(),
          churned: new Set(),
        });
      }

      const periodData = periods.get(periodKey)!;

      if (eventType === "INITIAL_PURCHASE" || eventType === "RENEWAL") {
        periodData.activeStart.add(userId);
      } else if (eventType === "EXPIRATION" || eventType === "CANCELLATION") {
        periodData.churned.add(userId);
      }
    }

    const result: ChurnDataPoint[] = Array.from(periods.values())
      .map((p) => {
        const activeStart = p.activeStart.size;
        const churned = p.churned.size;
        const churnRate = activeStart > 0 ? (churned / activeStart) * 100 : 0;

        return {
          date: p.date,
          churnRate: Math.round(churnRate * 100) / 100,
          churned,
          activeStart,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }, 60 * 60 * 1000);
}

/**
 * Calculate trial conversion rate over time
 * Conversion Rate = trials that converted to paid / total trials started
 */
export async function fetchConversionRate(
  startDate?: string,
  endDate?: string
): Promise<ConversionDataPoint[]> {
  const cacheKey = `metrics:conversion:${startDate || "all"}:${endDate || "now"}`;

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
      select: ["type", "event_timestamp_ms", "app_user_id", "is_trial_period"],
      limit: 50000,
    });

    // Track trials by month
    interface MonthData {
      date: string;
      trialsStarted: Set<string>;
      trialsConverted: Set<string>;
    }

    const months = new Map<string, MonthData>();

    for (const doc of docs) {
      const eventTs = doc.event_timestamp_ms as number;
      const eventType = doc.type as string;
      const userId = doc.app_user_id as string;
      const isTrial = doc.is_trial_period as boolean;

      const date = new Date(eventTs);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!months.has(monthKey)) {
        months.set(monthKey, {
          date: monthKey,
          trialsStarted: new Set(),
          trialsConverted: new Set(),
        });
      }

      const monthData = months.get(monthKey)!;

      if (eventType === "INITIAL_PURCHASE" && isTrial) {
        monthData.trialsStarted.add(userId);
      } else if (eventType === "RENEWAL" && !isTrial) {
        // User converted from trial to paid (first renewal after trial)
        monthData.trialsConverted.add(userId);
      }
    }

    const result: ConversionDataPoint[] = Array.from(months.values())
      .map((m) => {
        const trialsStarted = m.trialsStarted.size;
        const trialsConverted = m.trialsConverted.size;
        const conversionRate =
          trialsStarted > 0 ? (trialsConverted / trialsStarted) * 100 : 0;

        return {
          date: m.date,
          conversionRate: Math.round(conversionRate * 100) / 100,
          trialsStarted,
          trialsConverted,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }, 60 * 60 * 1000);
}

// --- Helper Functions ---

function getPeriodKey(date: Date, period: "weekly" | "monthly"): string {
  if (period === "monthly") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  } else {
    // Weekly: use Monday of the week as key
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split("T")[0];
  }
}

function fillMissingDays(
  data: MRRDataPoint[],
  startDate?: string,
  endDate?: string
): MRRDataPoint[] {
  if (data.length === 0) return data;

  const result: MRRDataPoint[] = [];
  const start = startDate ? new Date(startDate) : new Date(data[0].date);
  const end = endDate ? new Date(endDate) : new Date(data[data.length - 1].date);
  const dataMap = new Map(data.map((d) => [d.date, d]));

  let lastMRR = 0;
  let lastSubscribers = 0;

  const current = new Date(start);
  while (current <= end) {
    const dateKey = current.toISOString().split("T")[0];
    const existingData = dataMap.get(dateKey);

    if (existingData) {
      lastMRR = existingData.mrr;
      lastSubscribers = existingData.subscribers;
      result.push(existingData);
    } else {
      // Fill with last known values
      result.push({
        date: dateKey,
        mrr: lastMRR,
        subscribers: lastSubscribers,
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return result;
}

function convertToUsdCents(amount: number, currency: string): number {
  const centsPerUnit: Record<string, number> = {
    USD: 100,
    EUR: 110,
    GBP: 127,
    CAD: 73,
    AUD: 65,
    NZD: 60,
    CHF: 113,
    JPY: 0.67,
    KRW: 0.075,
    CNY: 14,
    INR: 1.2,
    IDR: 0.0063,
    PHP: 1.8,
    THB: 2.9,
    VND: 0.004,
    MYR: 23,
    SGD: 75,
    TWD: 3.1,
    BRL: 18,
    MXN: 5,
    COP: 0.023,
    ARS: 0.09,
    CLP: 0.1,
    PEN: 27,
    SEK: 9.5,
    NOK: 9.3,
    DKK: 14.7,
    PLN: 24,
    CZK: 4.3,
    HUF: 0.27,
    RON: 22,
    BGN: 56,
    HRK: 14.5,
    TRY: 3,
    ZAR: 5.5,
    AED: 27,
    SAR: 27,
    ILS: 28,
    EGP: 2,
    NGN: 0.065,
    RUB: 1.1,
    UAH: 2.4,
    KZT: 0.21,
  };

  const rate = centsPerUnit[currency];
  if (!rate) {
    console.warn(`Unknown currency: ${currency} for amount ${amount}`);
    if (amount > 1000) return Math.round(amount * 0.01);
    if (amount > 100) return Math.round(amount * 0.1);
    return Math.round(amount * 100);
  }
  return Math.round(amount * rate);
}
