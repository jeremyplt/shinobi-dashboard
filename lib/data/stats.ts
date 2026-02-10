/**
 * Direct data fetching functions for RevenueCat and Sentry stats
 * Called directly from server components (not via API routes)
 */

const REVENUECAT_API_KEY = process.env.REVENUECAT_API_KEY;
const SENTRY_TOKEN = process.env.SENTRY_TOKEN;
const SENTRY_ORG = process.env.SENTRY_ORG || "shinobi-japanese";
const SENTRY_PROJECT = process.env.SENTRY_PROJECT || "shinobi-japanese-react-native";

interface RevenueCatMetric {
  id: string;
  value: number;
}

interface RevenueCatResponse {
  metrics?: RevenueCatMetric[];
}

interface SentryIssue {
  id: string;
  title: string;
  count: string;
  userCount?: number;
  lastSeen: string;
  level: string;
  culprit: string;
}

export interface DashboardStats {
  mrr: number;
  mrrTrend: number;
  subscribers: number;
  subscribersTrend: number;
  crashFreeRate: number;
  crashFreeRateTrend: number;
  avgRating: number;
  avgRatingTrend: number;
  issues?: Array<{
    id: string;
    title: string;
    count: string;
    userCount: number;
    lastSeen: string;
    level: string;
    culprit: string;
  }>;
  error?: string;
}

async function fetchRevenueCat(): Promise<RevenueCatResponse> {
  if (!REVENUECAT_API_KEY) {
    throw new Error("REVENUECAT_API_KEY not configured");
  }

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

  return res.json();
}

async function fetchSentryIssues(): Promise<SentryIssue[]> {
  if (!SENTRY_TOKEN) {
    throw new Error("SENTRY_TOKEN not configured");
  }

  const res = await fetch(
    `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?query=is:unresolved&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${SENTRY_TOKEN}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Sentry API error: ${res.status}`);
  }

  return res.json();
}

/**
 * Fetch dashboard stats directly (for server components)
 */
export async function fetchStats(): Promise<DashboardStats> {
  let error: string | undefined;
  let mrr = 0;
  let subscribers = 0;
  let activeUsers = 0;
  let issues: DashboardStats["issues"] = [];

  // Fetch RevenueCat
  try {
    const data = await fetchRevenueCat();
    if (data.metrics) {
      for (const m of data.metrics) {
        if (m.id === "mrr") mrr = Math.round(m.value || 0);
        if (m.id === "active_subscriptions") subscribers = Math.round(m.value || 0);
        if (m.id === "active_users") activeUsers = Math.round(m.value || 0);
      }
    }
  } catch (e) {
    console.error("RevenueCat fetch failed:", e);
    error = `RevenueCat: ${e instanceof Error ? e.message : "Unknown error"}`;
  }

  // Fetch Sentry
  try {
    const sentryIssues = await fetchSentryIssues();
    issues = sentryIssues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      count: issue.count,
      userCount: issue.userCount || 0,
      lastSeen: issue.lastSeen,
      level: issue.level,
      culprit: issue.culprit,
    }));
  } catch (e) {
    console.error("Sentry fetch failed:", e);
    error = error 
      ? `${error}; Sentry: ${e instanceof Error ? e.message : "Unknown error"}`
      : `Sentry: ${e instanceof Error ? e.message : "Unknown error"}`;
  }

  // Calculate crash-free rate
  const totalEvents = issues.reduce(
    (sum, issue) => sum + (Number(issue.count) || 0),
    0
  );
  const crashFreeRate =
    activeUsers > 0 ? Math.max(0, 100 - (totalEvents / activeUsers) * 100) : 0;

  return {
    mrr,
    mrrTrend: 8.5, // TODO: calculate from historical data
    subscribers,
    subscribersTrend: 12.3, // TODO: calculate from historical data
    crashFreeRate: crashFreeRate > 0 ? Math.round(crashFreeRate * 10) / 10 : 0,
    crashFreeRateTrend: 2.1,
    avgRating: 4.7, // TODO: calculate from reviews
    avgRatingTrend: 0.3,
    issues: issues.slice(0, 5), // Top 5 for dashboard
    error,
  };
}
