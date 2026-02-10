import { NextResponse } from "next/server";
import { fetchErrors } from "@/lib/data/errors";

/**
 * API route for Sentry errors (legacy, kept for client-side usage)
 * Server components should call fetchErrors() directly
 */
export async function GET() {
  try {
    const data = await fetchErrors();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Sentry API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch errors",
        issues: [],
        totalIssues: 0,
      },
      { status: 500 }
    );
  }
}
