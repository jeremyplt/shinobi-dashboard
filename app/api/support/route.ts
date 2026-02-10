import { NextResponse } from "next/server";
import { fetchSupportData } from "@/lib/data/support";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchSupportData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Support API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch support data",
        tickets: [],
        stats: { total: 0, open: 0, replied: 0, bySource: {}, byPriority: {} },
      },
      { status: 500 }
    );
  }
}
