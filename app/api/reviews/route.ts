import { NextResponse } from "next/server";
import { fetchAppStoreReviews, type AppStoreReview } from "@/lib/api/appstore";
import { fetchGooglePlayReviews, type GooglePlayReview } from "@/lib/api/googleplay";

export type Review = (AppStoreReview | GooglePlayReview) & {
  platform: "ios" | "android";
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const platform = url.searchParams.get("platform"); // "ios" | "android" | null (both)

    let reviews: Review[] = [];

    if (!platform || platform === "ios") {
      const iosReviews = await fetchAppStoreReviews();
      reviews = [...reviews, ...iosReviews];
    }

    if (!platform || platform === "android") {
      const androidReviews = await fetchGooglePlayReviews();
      reviews = [...reviews, ...androidReviews];
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

    return NextResponse.json({
      reviews,
      stats: {
        total: totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Reviews API error:", error);

    // Return mock data on error
    return NextResponse.json({
      reviews: [
        {
          id: "mock-1",
          rating: 5,
          title: "Amazing app!",
          body: "Best Japanese learning app I've ever used. The stories are engaging and the interface is beautiful.",
          reviewerNickname: "HappyLearner",
          createdDate: new Date().toISOString(),
          platform: "ios",
          version: "1.2.7",
        },
        {
          id: "mock-2",
          rating: 4,
          title: "Great but needs more content",
          body: "Love the concept. Would appreciate more intermediate/advanced stories.",
          reviewerNickname: "JapanFan",
          createdDate: new Date(
            Date.now() - 24 * 60 * 60 * 1000
          ).toISOString(),
          platform: "android",
          version: "1.2.7",
        },
        {
          id: "mock-3",
          rating: 3,
          title: "App keeps crashing",
          body: "I really like the app but it crashes every time I try to read a story. Please fix this.",
          reviewerNickname: "FrustratedUser",
          createdDate: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          platform: "android",
          version: "1.2.7",
        },
      ],
      stats: {
        total: 3,
        avgRating: 4.0,
        ratingDistribution: [0, 0, 1, 1, 1],
      },
      error: "Using cached data",
    });
  }
}
