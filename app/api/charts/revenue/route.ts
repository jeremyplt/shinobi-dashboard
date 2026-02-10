import { NextResponse } from "next/server";
import { fetchRevenueHistory } from "@/lib/data/revenuecat";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start") || undefined;
    const endDate = searchParams.get("end") || undefined;

    const data = await fetchRevenueHistory(startDate, endDate);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Revenue chart API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch revenue data",
        data: [],
      },
      { status: 500 }
    );
  }
}
