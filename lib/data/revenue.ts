/**
 * Revenue and user growth data for charts
 * Fetches historical data from RevenueCat
 */

const REVENUECAT_API_KEY = process.env.REVENUECAT_API_KEY;

export interface ChartDataPoint {
  month: string;
  value: number;
}

export interface RevenueData {
  mrrHistory: ChartDataPoint[];
  subscribersHistory: ChartDataPoint[];
  error?: string;
}

/**
 * Fetch revenue history from RevenueCat
 * Note: Historical data requires RevenueCat Pro plan
 */
export async function fetchRevenueHistory(): Promise<RevenueData> {
  try {
    if (!REVENUECAT_API_KEY) {
      throw new Error("REVENUECAT_API_KEY not configured");
    }

    // Try to fetch historical overview data
    const res = await fetch(
      "https://api.revenuecat.com/v2/projects/projc4678a43/metrics/overview",
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

    // RevenueCat v2 API returns current metrics, not historical data
    // For historical data, we'd need to use their charting API or store data over time
    // For now, we'll return current values and note that historical data is unavailable

    let currentMrr = 0;
    let currentSubscribers = 0;

    if (data.metrics) {
      for (const m of data.metrics) {
        if (m.id === "mrr") currentMrr = Math.round(m.value || 0);
        if (m.id === "active_subscriptions") currentSubscribers = Math.round(m.value || 0);
      }
    }

    // Return current values as single data point
    // TODO: Implement proper historical tracking (store in DB or use RevenueCat charting API)
    const currentMonth = new Date().toLocaleDateString("en-US", { month: "short" });

    return {
      mrrHistory: [{ month: currentMonth, value: currentMrr }],
      subscribersHistory: [{ month: currentMonth, value: currentSubscribers }],
      error: "Historical data not available. Showing current values only.",
    };
  } catch (e) {
    console.error("RevenueCat revenue history fetch failed:", e);
    return {
      mrrHistory: [],
      subscribersHistory: [],
      error: e instanceof Error ? e.message : "Failed to fetch revenue data",
    };
  }
}
