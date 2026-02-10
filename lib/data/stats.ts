/**
 * Dashboard overview stats
 * Aggregates data from all sources for the KPI cards
 */

import { fetchRevenueCatOverview } from "./revenuecat";
import { fetchErrorsOverview, type SentryIssue } from "./sentry";
import { getCrashFreeRate } from "./google-play";
import { fetchUserOverview } from "./users";
import { fetchReviews } from "./reviews";

export interface DashboardStats {
  mrr: number;
  mrrTrend: number;
  subscribers: number;
  subscribersTrend: number;
  totalUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  crashFreeRate: number;
  crashFreeRateTrend: number;
  avgRating: number;
  avgRatingTrend: number;
  revenue28d: number;
  activeTrials: number;
  totalErrors: number;
  issues: Array<{
    id: string;
    title: string;
    count: number;
    userCount: number;
    lastSeen: string;
    level: string;
    culprit: string;
  }>;
  errors: string[];
}

/**
 * Fetch all dashboard stats from live APIs
 */
export async function fetchStats(): Promise<DashboardStats> {
  const errors: string[] = [];

  // Fetch all data sources in parallel
  const [revenueCat, sentryData, crashFreeRate, userOverview, reviewsData] =
    await Promise.allSettled([
      fetchRevenueCatOverview(),
      fetchErrorsOverview(),
      getCrashFreeRate(),
      fetchUserOverview(),
      fetchReviews(),
    ]);

  // RevenueCat
  let mrr = 0;
  let subscribers = 0;
  let revenue28d = 0;
  let activeTrials = 0;

  if (revenueCat.status === "fulfilled") {
    mrr = revenueCat.value.mrr;
    subscribers = revenueCat.value.activeSubscriptions;
    revenue28d = revenueCat.value.revenue28d;
    activeTrials = revenueCat.value.activeTrials;
  } else {
    errors.push(`RevenueCat: ${revenueCat.reason?.message || "Failed"}`);
  }

  // Sentry
  let issues: SentryIssue[] = [];
  let totalErrors = 0;

  if (sentryData.status === "fulfilled") {
    issues = sentryData.value.issues;
    totalErrors = sentryData.value.totalEventsToday;
  } else {
    errors.push(`Sentry: ${sentryData.reason?.message || "Failed"}`);
  }

  // Google Play crash rate
  let crashFree = 0;
  if (crashFreeRate.status === "fulfilled") {
    crashFree = crashFreeRate.value;
  } else {
    errors.push(
      `Google Play: ${crashFreeRate.reason?.message || "Failed"}`
    );
  }

  // Firebase users
  let totalUsers = 0;
  let newUsersToday = 0;
  let newUsersThisMonth = 0;

  if (userOverview.status === "fulfilled") {
    totalUsers = userOverview.value.totalUsers;
    newUsersToday = userOverview.value.newUsersToday;
    newUsersThisMonth = userOverview.value.newUsersThisMonth;
  } else {
    errors.push(
      `Firebase: ${userOverview.reason?.message || "Failed"}`
    );
  }

  // Reviews
  let avgRating = 0;
  if (reviewsData.status === "fulfilled") {
    avgRating = reviewsData.value.stats.avgRating;
  } else {
    errors.push(`Reviews: ${reviewsData.reason?.message || "Failed"}`);
  }

  return {
    mrr,
    mrrTrend: 0, // Will be calculated in components from historical data
    subscribers,
    subscribersTrend: 0,
    totalUsers,
    newUsersToday,
    newUsersThisMonth,
    crashFreeRate: crashFree,
    crashFreeRateTrend: 0,
    avgRating,
    avgRatingTrend: 0,
    revenue28d,
    activeTrials,
    totalErrors,
    issues: issues.map((i) => ({
      id: i.id,
      title: i.title,
      count: i.count,
      userCount: i.userCount,
      lastSeen: i.lastSeen,
      level: i.level,
      culprit: i.culprit,
    })),
    errors,
  };
}
