import { NextResponse } from "next/server";
import { fetchConversionRate } from "@/lib/data/metrics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch last 180 days (6 months) of conversion data
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const data = await fetchConversionRate(startDate, endDate);

    return NextResponse.json({
      data,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Conversion Rate API error:", error);
    return NextResponse.json(
      {
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}
