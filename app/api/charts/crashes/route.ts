import { NextResponse } from "next/server";
import { fetchCrashRates, fetchAnrRates } from "@/lib/data/google-play";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Math.min(
    Math.max(parseInt(searchParams.get("days") || "90", 10), 1),
    180
  );

  const errors: string[] = [];

  let crashRates: Awaited<ReturnType<typeof fetchCrashRates>> = [];
  let anrRates: Awaited<ReturnType<typeof fetchAnrRates>> = [];

  try {
    crashRates = await fetchCrashRates(days);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown";
    console.error("Crash rate fetch failed:", msg);
    errors.push(`Crash rates: ${msg}`);
  }

  try {
    anrRates = await fetchAnrRates(days);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown";
    console.error("ANR rate fetch failed:", msg);
    errors.push(`ANR rates: ${msg}`);
  }

  return NextResponse.json({
    crashRates,
    anrRates,
    ...(errors.length > 0 ? { errors } : {}),
  });
}
