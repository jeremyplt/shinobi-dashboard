import { NextResponse } from "next/server";
import { fetchRevenueByCountry } from "@/lib/data/analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch last 90 days
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const data = await fetchRevenueByCountry(startDate, endDate);

    return NextResponse.json({
      data,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Revenue by Country API error:", error);
    return NextResponse.json(
      {
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}
