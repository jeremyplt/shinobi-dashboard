import { NextResponse } from "next/server";
import { fetchRevenueHistory } from "@/lib/data/revenuecat";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "90");
    
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
    
    const data = await fetchRevenueHistory(startDate, endDate);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Revenue history API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error", data: [] },
      { status: 500 }
    );
  }
}
