import { NextResponse } from "next/server";
import { fetchUserGrowth } from "@/lib/data/users";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start") || undefined;
    const endDate = searchParams.get("end") || undefined;

    const data = await fetchUserGrowth(startDate, endDate);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Users chart API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch user data",
        data: [],
      },
      { status: 500 }
    );
  }
}
