import { NextResponse } from "next/server";
import { estimateLTV } from "@/lib/data/analytics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await estimateLTV();

    return NextResponse.json({
      data,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("LTV API error:", error);
    return NextResponse.json(
      {
        data: {
          avgSubscriptionDuration: 0,
          avgMonthlyRevenue: 0,
          estimatedLTV: 0,
        },
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}
