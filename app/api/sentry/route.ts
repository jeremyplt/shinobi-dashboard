import { NextResponse } from "next/server";
import { fetchSentryIssues } from "@/lib/data/sentry";

export async function GET() {
  try {
    const issues = await fetchSentryIssues(25);
    return NextResponse.json({ issues });
  } catch (error) {
    console.error("Sentry API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch errors",
        issues: [],
      },
      { status: 500 }
    );
  }
}
