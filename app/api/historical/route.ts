import { NextResponse } from "next/server";
import { getHistoricalMetrics } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Math.min(
      Math.max(parseInt(searchParams.get("days") || "30", 10), 1),
      365
    );

    const metrics = await getHistoricalMetrics(days);

    return NextResponse.json({ metrics, days });
  } catch (error) {
    console.error("Historical data fetch failed:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch historical data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
