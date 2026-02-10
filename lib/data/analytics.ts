/**
 * Advanced analytics calculations
 * - ARPU (Average Revenue Per User)
 * - LTV (Lifetime Value)
 * - Revenue by Country/Currency
 */

import { runQuery } from "./firebase-admin";
import { cached } from "./cache";

export interface ARPUDataPoint {
  date: string; // YYYY-MM (monthly)
  arpu: number; // USD cents
  totalRevenue: number;
  activeUsers: number;
}

export interface RevenueByCountry {
  country: string; // currency code as proxy
  revenue: number; // USD cents
  percentage: number;
  transactions: number;
}

export interface LTVEstimate {
  avgSubscriptionDuration: number; // days
  avgMonthlyRevenue: number; // USD cents
  estimatedLTV: number; // USD cents
}

/**
 * Calculate ARPU (Average Revenue Per User)
 * Uses RevenueCat API for current accurate ARPU
 * Historical ARPU requires daily snapshots (not yet implemented)
 */
export async function fetchARPU(
  startDate?: string,
  endDate?: string
): Promise<ARPUDataPoint[]> {
  const cacheKey = `analytics:arpu:${startDate || "all"}:${endDate || "now"}`;

  return cached(cacheKey, async () => {
    // Get accurate current metrics from RevenueCat API
    const { fetchRevenueCatOverview } = await import("./revenuecat");
    const overview = await fetchRevenueCatOverview();
    
    // Calculate current ARPU: MRR / active subscribers
    const currentArpu = overview.activeSubscriptions > 0 
      ? Math.round(overview.mrr / overview.activeSubscriptions)
      : 0;
    
    // Return current ARPU as a single data point
    // Historical ARPU will be added once daily snapshots are implemented
    const today = new Date();
    const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    
    return [{
      date: monthKey,
      arpu: currentArpu,
      totalRevenue: overview.mrr,
      activeUsers: overview.activeSubscriptions,
    }];
  }, 30 * 60 * 1000); // 30 min cache
}

/**
 * Calculate revenue breakdown by country (using currency as proxy)
 */
export async function fetchRevenueByCountry(
  startDate?: string,
  endDate?: string
): Promise<RevenueByCountry[]> {
  const cacheKey = `analytics:revenue-by-country:${startDate || "all"}:${endDate || "now"}`;

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
      select: [
        "type",
        "currency",
        "price_in_purchased_currency",
      ],
      limit: 50000,
    });

    // Aggregate by currency
    const currencyRevenue = new Map<string, { revenue: number; transactions: number }>();

    for (const doc of docs) {
      const eventType = doc.type as string;
      const price = (doc.price_in_purchased_currency as number) || 0;
      const currency = (doc.currency as string) || "USD";

      // Only count revenue events
      if (!["INITIAL_PURCHASE", "RENEWAL", "NON_RENEWING_PURCHASE"].includes(eventType)) {
        continue;
      }

      if (!currencyRevenue.has(currency)) {
        currencyRevenue.set(currency, { revenue: 0, transactions: 0 });
      }

      const data = currencyRevenue.get(currency)!;
      data.revenue += convertToUsdCents(price, currency);
      data.transactions++;
    }

    // Calculate total and percentages
    const totalRevenue = Array.from(currencyRevenue.values()).reduce(
      (sum, d) => sum + d.revenue,
      0
    );

    const result: RevenueByCountry[] = Array.from(currencyRevenue.entries())
      .map(([currency, data]) => ({
        country: currency,
        revenue: data.revenue,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
        transactions: data.transactions,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return result;
  }, 60 * 60 * 1000);
}

/**
 * Estimate LTV based on subscription duration and revenue
 * Uses RevenueCat API for accurate ARPU calculation
 */
export async function estimateLTV(): Promise<LTVEstimate> {
  return cached("analytics:ltv", async () => {
    // Get accurate current metrics from RevenueCat API
    const { fetchRevenueCatOverview } = await import("./revenuecat");
    const overview = await fetchRevenueCatOverview();
    
    // Calculate ARPU: MRR / active subscribers
    const arpu = overview.activeSubscriptions > 0 
      ? Math.round(overview.mrr / overview.activeSubscriptions)
      : 0;
    
    // Fetch subscription events to calculate average duration
    const docs = await runQuery({
      collection: "revenuecat_events",
      select: [
        "type",
        "event_timestamp_ms",
        "app_user_id",
        "expiration_at_ms",
      ],
      limit: 50000,
    });

    // Track user subscription durations
    interface UserSubscription {
      userId: string;
      startDate: number;
      endDate: number;
    }

    const userSubs = new Map<string, UserSubscription>();

    for (const doc of docs) {
      const eventTs = doc.event_timestamp_ms as number;
      const eventType = doc.type as string;
      const userId = doc.app_user_id as string;
      const expirationMs = (doc.expiration_at_ms as number) || eventTs;

      if (eventType === "INITIAL_PURCHASE") {
        userSubs.set(userId, {
          userId,
          startDate: eventTs,
          endDate: expirationMs,
        });
      } else if (eventType === "RENEWAL") {
        const sub = userSubs.get(userId);
        if (sub) {
          sub.endDate = Math.max(sub.endDate, expirationMs);
        }
      }
    }

    // Calculate average duration
    const subscriptions = Array.from(userSubs.values());
    const totalDuration = subscriptions.reduce(
      (sum, s) => sum + (s.endDate - s.startDate),
      0
    );

    const avgDurationMs =
      subscriptions.length > 0 ? totalDuration / subscriptions.length : 0;
    const avgDurationDays = Math.round(avgDurationMs / (1000 * 60 * 60 * 24));

    // LTV = ARPU * avg duration in months
    const avgDurationMonths = avgDurationDays / 30;
    const estimatedLTV = Math.round(arpu * avgDurationMonths);

    return {
      avgSubscriptionDuration: avgDurationDays,
      avgMonthlyRevenue: arpu, // This is actually ARPU from RevenueCat
      estimatedLTV,
    };
  }, 2 * 60 * 60 * 1000); // 2 hour cache
}

// --- Helper Functions ---

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
    if (amount > 1000) return Math.round(amount * 0.01);
    if (amount > 100) return Math.round(amount * 0.1);
    return Math.round(amount * 100);
  }
  return Math.round(amount * rate);
}
