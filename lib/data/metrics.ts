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
 * Calculate MRR evolution over time from RevenueCat API
 * NOTE: Historical MRR data requires daily snapshots (not yet implemented)
 * For now, we show current MRR from RevenueCat API
 */
export async function fetchMRREvolution(
  startDate?: string,
  endDate?: string
): Promise<MRRDataPoint[]> {
  const cacheKey = `metrics:mrr:${startDate || "all"}:${endDate || "now"}`;

  return cached(cacheKey, async () => {
    // Import RevenueCat API function dynamically to avoid circular dependency
    const { fetchRevenueCatOverview } = await import("./revenuecat");
    
    try {
      const overview = await fetchRevenueCatOverview();
      
      // Return current MRR as a single data point
      // Historical data will be added once daily snapshot cron is implemented
      const today = new Date().toISOString().split("T")[0];
      
      return [{
        date: today,
        mrr: overview.mrr,
        subscribers: overview.activeSubscriptions,
      }];
    } catch (error) {
      console.error("Failed to fetch MRR from RevenueCat API:", error);
      return [];
    }
  }, 30 * 60 * 1000); // 30 min cache
}

/**
 * Calculate churn rate over time
 * NOTE: Accurate churn calculation requires total active subscribers at each period
 * Previous calculation was incorrect (showed 40-70% which is wrong)
 * This feature is disabled until daily subscriber snapshots are implemented
 */
export async function fetchChurnRate(
  startDate?: string,
  endDate?: string,
  period: "weekly" | "monthly" = "weekly"
): Promise<ChurnDataPoint[]> {
  // Return empty array - chart will be hidden in the UI
  // Accurate churn = churned in period / total active subscribers at start
  // We don't have historical total active subscriber counts
  return [];
}

/**
 * Calculate trial conversion rate over time
 * NOTE: This app currently has no trial offering (only 1 active trial)
 * This feature is disabled
 */
export async function fetchConversionRate(
  startDate?: string,
  endDate?: string
): Promise<ConversionDataPoint[]> {
  // Return empty array - app doesn't use trials
  return [];
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
