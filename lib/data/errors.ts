/**
 * Direct data fetching for Sentry error tracking
 * Called directly from server components
 */

const SENTRY_TOKEN = process.env.SENTRY_TOKEN;
const SENTRY_ORG = process.env.SENTRY_ORG || "shinobi-japanese";
const SENTRY_PROJECT = process.env.SENTRY_PROJECT || "shinobi-japanese-react-native";

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

export interface ErrorsData {
  issues: SentryIssue[];
  totalIssues: number;
  error?: string;
}

/**
 * Fetch Sentry issues directly (for server components)
 */
export async function fetchErrors(): Promise<ErrorsData> {
  try {
    if (!SENTRY_TOKEN) {
      throw new Error("SENTRY_TOKEN not configured");
    }

    const response = await fetch(
      `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?query=is:unresolved&limit=25`,
      {
        headers: {
          Authorization: `Bearer ${SENTRY_TOKEN}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Sentry API error: ${response.status}`);
    }

    const rawIssues = await response.json();

    const issues: SentryIssue[] = rawIssues.map((issue: any) => ({
      id: issue.id,
      title: issue.title,
      count: Number(issue.count) || 0,
      userCount: issue.userCount || 0,
      lastSeen: issue.lastSeen,
      firstSeen: issue.firstSeen,
      level: issue.level,
      culprit: issue.culprit,
    }));

    return {
      issues,
      totalIssues: issues.length,
    };
  } catch (e) {
    console.error("Sentry fetch failed:", e);
    return {
      issues: [],
      totalIssues: 0,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
