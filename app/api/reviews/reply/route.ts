import { NextResponse } from "next/server";
import { replyToAppStoreReview, replyToGooglePlayReview } from "@/lib/api/review-reply";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reviewId, platform, replyText } = body;

    if (!reviewId || !platform || !replyText) {
      return NextResponse.json(
        { error: "Missing required fields: reviewId, platform, replyText" },
        { status: 400 }
      );
    }

    if (replyText.length > 5970) {
      return NextResponse.json(
        { error: "Reply text too long (max 5970 characters)" },
        { status: 400 }
      );
    }

    let result;
    if (platform === "ios") {
      result = await replyToAppStoreReview(reviewId, replyText);
    } else if (platform === "android") {
      result = await replyToGooglePlayReview(reviewId, replyText);
    } else {
      return NextResponse.json(
        { error: "Invalid platform. Use 'ios' or 'android'" },
        { status: 400 }
      );
    }

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: result.error || "Reply failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Review reply API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
