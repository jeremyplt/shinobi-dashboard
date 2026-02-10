import { NextResponse } from "next/server";
import { fetchRetention } from "@/lib/data/posthog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchRetention();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Retention API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
