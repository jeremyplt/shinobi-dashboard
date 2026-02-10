import { NextResponse } from "next/server";
import { insertDailySnapshot, type DailyMetrics } from "@/lib/db";
import { fetchStats } from "@/lib/data/stats";
import { fetchReviews } from "@/lib/data/reviews";
import { fetchErrors } from "@/lib/data/errors";

const SNAPSHOT_SECRET = process.env.SNAPSHOT_SECRET;

export async function POST(request: Request) {
  // Verify authorization
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!SNAPSHOT_SECRET || token !== SNAPSHOT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Collect metrics from all sources in parallel
    const [stats, reviewsData, errorsData] = await Promise.all([
      fetchStats(),
      fetchReviews(),
      fetchErrors(),
    ]);

    // Separate iOS and Android review stats
    const iosReviews = reviewsData.reviews.filter((r) => r.platform === "ios");
    const androidReviews = reviewsData.reviews.filter(
      (r) => r.platform === "android"
    );

    const iosAvgRating =
      iosReviews.length > 0
        ? iosReviews.reduce((sum, r) => sum + r.rating, 0) / iosReviews.length
        : null;
    const androidAvgRating =
      androidReviews.length > 0
        ? androidReviews.reduce((sum, r) => sum + r.rating, 0) /
          androidReviews.length
        : null;

    const today = new Date().toISOString().split("T")[0];

    const metrics: DailyMetrics = {
      date: today,
      mrr_cents: stats.mrr * 100, // Convert dollars to cents
      active_subscribers: stats.subscribers,
      new_subscribers: null, // Not available from current API
      churned_subscribers: null,
      active_trials: null,
      crash_free_rate: stats.crashFreeRate > 0 ? stats.crashFreeRate : null,
      total_errors: errorsData.totalIssues,
      ios_rating: iosAvgRating
        ? Math.round(iosAvgRating * 100) / 100
        : null,
      android_rating: androidAvgRating
        ? Math.round(androidAvgRating * 100) / 100
        : null,
      ios_reviews_count: iosReviews.length,
      android_reviews_count: androidReviews.length,
    };

    const result = await insertDailySnapshot(metrics);

    return NextResponse.json({
      success: true,
      snapshot: result,
    });
  } catch (error) {
    console.error("Snapshot failed:", error);
    return NextResponse.json(
      {
        error: "Snapshot failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
