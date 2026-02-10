import { NextResponse } from "next/server";
import { fetchErrorHistory } from "@/lib/data/sentry";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Math.min(
      Math.max(parseInt(searchParams.get("days") || "90", 10), 1),
      90 // Sentry max
    );

    const data = await fetchErrorHistory(days);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Errors chart API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch error data",
        data: [],
      },
      { status: 500 }
    );
  }
}
