import { NextResponse } from "next/server";
import { fetchAnrRates } from "@/lib/data/google-play";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await fetchAnrRates(90);

    return NextResponse.json({
      data,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("ANR Rate API error:", error);
    return NextResponse.json(
      {
        data: [],
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}
