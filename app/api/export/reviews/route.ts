import { NextResponse } from "next/server";
import { fetchReviews } from "@/lib/data/reviews";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchReviews();
    
    // Generate CSV
    const headers = ["Date", "Platform", "Rating", "Title", "Body", "Reviewer", "Version"];
    const rows = data.reviews.map((r) => [
      new Date(r.createdDate).toISOString().split("T")[0],
      r.platform,
      r.rating,
      `"${(r.title || "").replace(/"/g, '""')}"`,
      `"${(r.body || "").replace(/"/g, '""')}"`,
      `"${(r.reviewerNickname || "").replace(/"/g, '""')}"`,
      r.version,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="shinobi-reviews-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export reviews error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
