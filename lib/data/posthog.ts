/**
 * PostHog analytics data fetching
 * - DAU, WAU, MAU
 * - Session counts
 * - Retention (D1, D7, D30)
 * - Top events
 */

import { cached } from "./cache";

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_HOST = "https://us.posthog.com";

// --- Types ---

export interface ActiveUsers {
  dau: number;
  wau: number;
  mau: number;
  dauTrend: DailyMetric[];
  wauTrend: DailyMetric[];
  mauTrend: DailyMetric[];
}

export interface DailyMetric {
  date: string;
  value: number;
}

export interface RetentionData {
  d1: number;
  d7: number;
  d30: number;
  trend: { date: string; d1: number; d7: number; d30: number }[];
}

export interface TopEvent {
  event: string;
  count: number;
  uniqueUsers: number;
}

export interface SessionStats {
  totalSessions: number;
  avgSessionDuration: number; // seconds
  sessionsPerUser: number;
  dailySessions: DailyMetric[];
}

export interface AnalyticsOverview {
  activeUsers: ActiveUsers;
  retention: RetentionData;
  topEvents: TopEvent[];
  sessions: SessionStats;
}

// --- PostHog API Helpers ---

async function posthogQuery(query: string): Promise<Record<string, unknown>> {
  if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
    throw new Error("PostHog credentials not configured");
  }

  const res = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${POSTHOG_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: {
        kind: "HogQLQuery",
        query,
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PostHog API error ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

async function posthogInsight(params: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
    throw new Error("PostHog credentials not configured");
  }

  const res = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${POSTHOG_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PostHog insight error ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

// --- Active Users (DAU, WAU, MAU) ---

export async function fetchActiveUsers(days: number = 30): Promise<ActiveUsers> {
  return cached(`posthog:active-users:${days}`, async () => {
    // Use HogQL to get unique users per day
    const dauResult = await posthogQuery(`
      SELECT 
        toDate(timestamp) as day,
        count(DISTINCT distinct_id) as users
      FROM events
      WHERE timestamp >= now() - interval ${days} day
        AND event NOT LIKE '$%'
      GROUP BY day
      ORDER BY day
    `);

    const dauRows = (dauResult as { results?: unknown[][] }).results || [];
    const dauTrend: DailyMetric[] = dauRows.map((row: unknown[]) => ({
      date: String(row[0]),
      value: Number(row[1]) || 0,
    }));

    // Calculate WAU and MAU from the daily data using HogQL
    const wauResult = await posthogQuery(`
      SELECT 
        toStartOfWeek(timestamp, 1) as week,
        count(DISTINCT distinct_id) as users
      FROM events
      WHERE timestamp >= now() - interval ${days} day
        AND event NOT LIKE '$%'
      GROUP BY week
      ORDER BY week
    `);

    const wauRows = (wauResult as { results?: unknown[][] }).results || [];
    const wauTrend: DailyMetric[] = wauRows.map((row: unknown[]) => ({
      date: String(row[0]),
      value: Number(row[1]) || 0,
    }));

    // Monthly active
    const mauResult = await posthogQuery(`
      SELECT 
        toStartOfMonth(timestamp) as month,
        count(DISTINCT distinct_id) as users
      FROM events
      WHERE timestamp >= now() - interval 90 day
        AND event NOT LIKE '$%'
      GROUP BY month
      ORDER BY month
    `);

    const mauRows = (mauResult as { results?: unknown[][] }).results || [];
    const mauTrend: DailyMetric[] = mauRows.map((row: unknown[]) => ({
      date: String(row[0]),
      value: Number(row[1]) || 0,
    }));

    // Current values
    const dau = dauTrend.length > 0 ? dauTrend[dauTrend.length - 1].value : 0;
    const wau = wauTrend.length > 0 ? wauTrend[wauTrend.length - 1].value : 0;
    const mau = mauTrend.length > 0 ? mauTrend[mauTrend.length - 1].value : 0;

    return { dau, wau, mau, dauTrend, wauTrend, mauTrend };
  }, 30 * 60 * 1000);
}

// --- Retention ---

export async function fetchRetention(): Promise<RetentionData> {
  return cached("posthog:retention", async () => {
    // D1 retention: users who came back the next day
    const retentionResult = await posthogQuery(`
      WITH new_users AS (
        SELECT 
          distinct_id,
          toDate(min(timestamp)) as first_seen
        FROM events
        WHERE timestamp >= now() - interval 30 day
          AND event NOT LIKE '$%'
        GROUP BY distinct_id
      ),
      return_d1 AS (
        SELECT nu.distinct_id
        FROM new_users nu
        JOIN events e ON e.distinct_id = nu.distinct_id
          AND toDate(e.timestamp) = nu.first_seen + interval 1 day
          AND e.event NOT LIKE '$%'
        WHERE nu.first_seen <= now() - interval 2 day
        GROUP BY nu.distinct_id
      ),
      return_d7 AS (
        SELECT nu.distinct_id
        FROM new_users nu
        JOIN events e ON e.distinct_id = nu.distinct_id
          AND toDate(e.timestamp) BETWEEN nu.first_seen + interval 6 day AND nu.first_seen + interval 8 day
          AND e.event NOT LIKE '$%'
        WHERE nu.first_seen <= now() - interval 9 day
        GROUP BY nu.distinct_id
      ),
      return_d30 AS (
        SELECT nu.distinct_id
        FROM new_users nu
        JOIN events e ON e.distinct_id = nu.distinct_id
          AND toDate(e.timestamp) BETWEEN nu.first_seen + interval 28 day AND nu.first_seen + interval 32 day
          AND e.event NOT LIKE '$%'
        WHERE nu.first_seen <= now() - interval 33 day
        GROUP BY nu.distinct_id
      )
      SELECT
        (SELECT count() FROM new_users WHERE first_seen <= now() - interval 2 day) as total_d1_eligible,
        (SELECT count() FROM return_d1) as retained_d1,
        (SELECT count() FROM new_users WHERE first_seen <= now() - interval 9 day) as total_d7_eligible,
        (SELECT count() FROM return_d7) as retained_d7,
        (SELECT count() FROM new_users WHERE first_seen <= now() - interval 33 day) as total_d30_eligible,
        (SELECT count() FROM return_d30) as retained_d30
    `);

    const rows = (retentionResult as { results?: unknown[][] }).results || [];
    const row = rows[0] || [0, 0, 0, 0, 0, 0];

    const totalD1 = Number(row[0]) || 1;
    const retainedD1 = Number(row[1]) || 0;
    const totalD7 = Number(row[2]) || 1;
    const retainedD7 = Number(row[3]) || 0;
    const totalD30 = Number(row[4]) || 1;
    const retainedD30 = Number(row[5]) || 0;

    return {
      d1: Math.round((retainedD1 / totalD1) * 100 * 10) / 10,
      d7: Math.round((retainedD7 / totalD7) * 100 * 10) / 10,
      d30: Math.round((retainedD30 / totalD30) * 100 * 10) / 10,
      trend: [], // Can be expanded later
    };
  }, 60 * 60 * 1000);
}

// --- Top Events ---

export async function fetchTopEvents(days: number = 7, limit: number = 15): Promise<TopEvent[]> {
  return cached(`posthog:top-events:${days}:${limit}`, async () => {
    const result = await posthogQuery(`
      SELECT 
        event,
        count() as total,
        count(DISTINCT distinct_id) as unique_users
      FROM events
      WHERE timestamp >= now() - interval ${days} day
        AND event NOT LIKE '$%'
        AND event NOT IN ('$pageview', '$pageleave', '$autocapture', '$rageclick')
      GROUP BY event
      ORDER BY total DESC
      LIMIT ${limit}
    `);

    const rows = (result as { results?: unknown[][] }).results || [];
    return rows.map((row: unknown[]) => ({
      event: String(row[0]),
      count: Number(row[1]) || 0,
      uniqueUsers: Number(row[2]) || 0,
    }));
  }, 30 * 60 * 1000);
}

// --- Session Stats ---

export async function fetchSessionStats(days: number = 30): Promise<SessionStats> {
  return cached(`posthog:sessions:${days}`, async () => {
    // Daily session counts using $session_id
    const sessionResult = await posthogQuery(`
      SELECT 
        toDate(min(timestamp)) as day,
        count(DISTINCT $session_id) as sessions
      FROM events
      WHERE timestamp >= now() - interval ${days} day
        AND $session_id IS NOT NULL
        AND $session_id != ''
      GROUP BY toDate(timestamp)
      ORDER BY day
    `);

    const sessionRows = (sessionResult as { results?: unknown[][] }).results || [];
    const dailySessions: DailyMetric[] = sessionRows.map((row: unknown[]) => ({
      date: String(row[0]),
      value: Number(row[1]) || 0,
    }));

    // Total sessions and avg duration
    const totalResult = await posthogQuery(`
      SELECT
        count(DISTINCT $session_id) as total_sessions,
        count(DISTINCT distinct_id) as total_users,
        avg(session_duration) as avg_duration
      FROM (
        SELECT 
          $session_id,
          distinct_id,
          dateDiff('second', min(timestamp), max(timestamp)) as session_duration
        FROM events
        WHERE timestamp >= now() - interval ${days} day
          AND $session_id IS NOT NULL
          AND $session_id != ''
        GROUP BY $session_id, distinct_id
        HAVING session_duration > 0
      )
    `);

    const totalRows = (totalResult as { results?: unknown[][] }).results || [];
    const totalRow = totalRows[0] || [0, 0, 0];
    const totalSessions = Number(totalRow[0]) || 0;
    const totalUsers = Number(totalRow[1]) || 1;
    const avgDuration = Number(totalRow[2]) || 0;

    return {
      totalSessions,
      avgSessionDuration: Math.round(avgDuration),
      sessionsPerUser: Math.round((totalSessions / totalUsers) * 10) / 10,
      dailySessions,
    };
  }, 30 * 60 * 1000);
}

// --- Full Analytics Overview ---

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  const [activeUsers, retention, topEvents, sessions] = await Promise.allSettled([
    fetchActiveUsers(30),
    fetchRetention(),
    fetchTopEvents(7),
    fetchSessionStats(30),
  ]);

  return {
    activeUsers: activeUsers.status === "fulfilled" ? activeUsers.value : {
      dau: 0, wau: 0, mau: 0, dauTrend: [], wauTrend: [], mauTrend: [],
    },
    retention: retention.status === "fulfilled" ? retention.value : {
      d1: 0, d7: 0, d30: 0, trend: [],
    },
    topEvents: topEvents.status === "fulfilled" ? topEvents.value : [],
    sessions: sessions.status === "fulfilled" ? sessions.value : {
      totalSessions: 0, avgSessionDuration: 0, sessionsPerUser: 0, dailySessions: [],
    },
  };
}
