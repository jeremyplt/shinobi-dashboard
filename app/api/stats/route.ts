import { NextResponse } from "next/server";
import { fetchStats } from "@/lib/data/stats";

export async function GET() {
  try {
    const stats = await fetchStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch stats",
      },
      { status: 500 }
    );
  }
}
