import { NextResponse } from "next/server";
import { fetchStats } from "@/lib/data/stats";

/**
 * API route for stats (legacy, kept for client-side usage)
 * Server components should call fetchStats() directly
 */
export async function GET() {
  try {
    const stats = await fetchStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch stats",
        data: null,
      },
      { status: 500 }
    );
  }
}
