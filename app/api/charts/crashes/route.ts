import { NextResponse } from "next/server";
import { fetchCrashRates, fetchAnrRates } from "@/lib/data/google-play";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Math.min(
      Math.max(parseInt(searchParams.get("days") || "90", 10), 1),
      180
    );

    const [crashRates, anrRates] = await Promise.all([
      fetchCrashRates(days),
      fetchAnrRates(days),
    ]);

    return NextResponse.json({ crashRates, anrRates });
  } catch (error) {
    console.error("Crashes chart API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch crash data",
        crashRates: [],
        anrRates: [],
      },
      { status: 500 }
    );
  }
}
