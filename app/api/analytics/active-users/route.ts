import { NextResponse } from "next/server";
import { fetchActiveUsers } from "@/lib/data/posthog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const data = await fetchActiveUsers(days);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Active users API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
