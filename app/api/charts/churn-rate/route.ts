import { NextResponse } from "next/server";
import { fetchChurnRate } from "@/lib/data/metrics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") as "weekly" | "monthly") || "weekly";

    // Fetch last 90 days of churn data
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const data = await fetchChurnRate(startDate, endDate, period);

    return NextResponse.json({
      data,
      period,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Churn Rate API error:", error);
    return NextResponse.json(
      {
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}
