import { NextResponse } from "next/server";
import { fetchReviews } from "@/lib/data/reviews";

/**
 * API route for reviews (legacy, kept for client-side usage)
 * Server components should call fetchReviews() directly
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const platform = url.searchParams.get("platform"); // "ios" | "android" | null (both)

    const data = await fetchReviews(platform);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Reviews API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch reviews",
        reviews: [],
        stats: {
          total: 0,
          avgRating: 0,
          ratingDistribution: [0, 0, 0, 0, 0],
        },
      },
      { status: 500 }
    );
  }
}
