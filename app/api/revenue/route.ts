import { NextResponse } from "next/server";
import { fetchRevenueHistory } from "@/lib/data/revenue";

/**
 * API route for revenue data (legacy, kept for client-side usage)
 * Server components should call fetchRevenueHistory() directly
 */
export async function GET() {
  try {
    const data = await fetchRevenueHistory();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Revenue API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch revenue data",
        mrrHistory: [],
        subscribersHistory: [],
      },
      { status: 500 }
    );
  }
}
