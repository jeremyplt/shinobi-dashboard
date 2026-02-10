/**
 * Direct data fetching for App Store and Google Play reviews
 * Called directly from server components
 */

import { fetchAppStoreReviews, type AppStoreReview } from "@/lib/api/appstore";
import { fetchGooglePlayReviews, type GooglePlayReview } from "@/lib/api/googleplay";

export type Review = (AppStoreReview | GooglePlayReview) & {
  platform: "ios" | "android";
};

export interface ReviewsStats {
  total: number;
  avgRating: number;
  ratingDistribution: number[];
}

export interface ReviewsData {
  reviews: Review[];
  stats: ReviewsStats;
  error?: string;
}

/**
 * Fetch reviews from both App Store and Google Play
 * @param platform Optional filter: "ios" | "android" | null (both)
 */
export async function fetchReviews(platform?: string | null): Promise<ReviewsData> {
  let reviews: Review[] = [];
  let error: string | undefined;

  // Fetch iOS reviews
  if (!platform || platform === "ios") {
    try {
      const iosReviews = await fetchAppStoreReviews();
      reviews = [...reviews, ...iosReviews];
    } catch (e) {
      console.error("App Store fetch failed:", e);
      error = `App Store: ${e instanceof Error ? e.message : "Unknown error"}`;
    }
  }

  // Fetch Android reviews
  if (!platform || platform === "android") {
    try {
      const androidReviews = await fetchGooglePlayReviews();
      reviews = [...reviews, ...androidReviews];
    } catch (e) {
      console.error("Google Play fetch failed:", e);
      error = error
        ? `${error}; Google Play: ${e instanceof Error ? e.message : "Unknown error"}`
        : `Google Play: ${e instanceof Error ? e.message : "Unknown error"}`;
    }
  }

  // Sort by date descending
  reviews.sort(
    (a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );

  // Calculate stats
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const ratingDistribution = [1, 2, 3, 4, 5].map(
    (star) => reviews.filter((r) => r.rating === star).length
  );

  return {
    reviews,
    stats: {
      total: totalReviews,
      avgRating: totalReviews > 0 ? Math.round(avgRating * 10) / 10 : 0,
      ratingDistribution,
    },
    error,
  };
}
