/**
 * Sentry data fetching with historical error counts
 * Uses Sentry stats_v2 API for time series data
 */

import { cached } from "./cache";

const SENTRY_TOKEN = process.env.SENTRY_TOKEN;
const SENTRY_ORG = process.env.SENTRY_ORG || "shinobi-japanese";
const SENTRY_PROJECT =
  process.env.SENTRY_PROJECT || "shinobi-japanese-react-native";

// --- Types ---

export interface SentryIssue {
  id: string;
  title: string;
  count: number;
  userCount: number;
  lastSeen: string;
  firstSeen: string;
  level: string;
  culprit: string;
}

export interface DailyErrors {
  date: string; // YYYY-MM-DD
  accepted: number;
  rateLimited: number;
  invalid: number;
}

export interface ErrorsOverview {
  issues: SentryIssue[];
  totalUnresolved: number;
  totalEventsToday: number;
}

// --- Current Issues ---

export async function fetchSentryIssues(limit: number = 25): Promise<SentryIssue[]> {
  return cached(`sentry:issues:${limit}`, async () => {
    if (!SENTRY_TOKEN) {
      throw new Error("SENTRY_TOKEN not configured");
    }

    const res = await fetch(
      `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?query=is:unresolved&limit=${limit}`,
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

    const rawIssues = await res.json();

    return rawIssues.map((issue: Record<string, unknown>) => ({
      id: issue.id as string,
      title: issue.title as string,
      count: Number(issue.count) || 0,
      userCount: (issue.userCount as number) || 0,
      lastSeen: issue.lastSeen as string,
      firstSeen: issue.firstSeen as string,
      level: issue.level as string,
      culprit: issue.culprit as string,
    }));
  }, 15 * 60 * 1000); // 15 min cache
}

// --- Historical Error Stats ---

interface StatsGroup {
  by: { outcome: string };
  totals: { "sum(quantity)": number };
  series: { "sum(quantity)": number[] };
}

/**
 * Fetch daily error counts for the given period
 * Uses Sentry org-level stats_v2 endpoint
 */
export async function fetchErrorHistory(
  days: number = 90
): Promise<DailyErrors[]> {
  return cached(`sentry:history:${days}`, async () => {
    if (!SENTRY_TOKEN) {
      throw new Error("SENTRY_TOKEN not configured");
    }

    const res = await fetch(
      `https://sentry.io/api/0/organizations/${SENTRY_ORG}/stats_v2/?field=sum(quantity)&groupBy=outcome&category=error&interval=1d&statsPeriod=${days}d`,
      {
        headers: {
          Authorization: `Bearer ${SENTRY_TOKEN}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(`Sentry stats API error: ${res.status}`);
    }

    const data = await res.json();
    const intervals: string[] = data.intervals || [];
    const groups: StatsGroup[] = data.groups || [];

    // Build daily data from groups
    const acceptedGroup = groups.find(
      (g) => g.by.outcome === "accepted"
    );
    const rateLimitedGroup = groups.find(
      (g) => g.by.outcome === "rate_limited"
    );
    const invalidGroup = groups.find(
      (g) => g.by.outcome === "invalid"
    );

    const acceptedSeries = acceptedGroup?.series["sum(quantity)"] || [];
    const rateLimitedSeries = rateLimitedGroup?.series["sum(quantity)"] || [];
    const invalidSeries = invalidGroup?.series["sum(quantity)"] || [];

    return intervals.map((interval, i) => ({
      date: interval.split("T")[0],
      accepted: acceptedSeries[i] || 0,
      rateLimited: rateLimitedSeries[i] || 0,
      invalid: invalidSeries[i] || 0,
    }));
  }, 30 * 60 * 1000); // 30 min cache
}

/**
 * Get errors overview with issues and today's event count
 */
export async function fetchErrorsOverview(): Promise<ErrorsOverview> {
  const [issues, history] = await Promise.all([
    fetchSentryIssues(10),
    fetchErrorHistory(7),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const todayData = history.find((d) => d.date === today);

  return {
    issues,
    totalUnresolved: issues.length,
    totalEventsToday: todayData?.accepted || 0,
  };
}
