import { NextResponse } from "next/server";
import { fetchTopEvents } from "@/lib/data/posthog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");
    const limit = parseInt(searchParams.get("limit") || "15");
    const data = await fetchTopEvents(days, limit);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Top events API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
