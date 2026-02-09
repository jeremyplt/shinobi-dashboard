import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch revenue data
    const revenueResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/revenue`, {
      cache: "no-store",
    });
    const revenueData = await revenueResponse.json();

    // Fetch Sentry data
    const sentryResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/sentry`, {
      cache: "no-store",
    });
    const sentryData = await sentryResponse.json();

    // Calculate crash-free rate (simplified)
    const totalEvents = sentryData.issues.reduce((sum: number, issue: any) => sum + issue.count, 0);
    const crashFreeRate = revenueData.activeUsers > 0 
      ? Math.max(0, 100 - (totalEvents / revenueData.activeUsers) * 100).toFixed(2)
      : "99.5";

    return NextResponse.json({
      mrr: revenueData.mrr,
      mrrTrend: 8.5,
      subscribers: revenueData.activeSubscriptions,
      subscribersTrend: 12.3,
      crashFreeRate: parseFloat(crashFreeRate),
      crashFreeRateTrend: 2.1,
      avgRating: 4.7,
      avgRatingTrend: 0.3,
      hasErrors: revenueData.error || sentryData.error,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    
    // Return mock data on error
    return NextResponse.json({
      mrr: 12450,
      mrrTrend: 8.5,
      subscribers: 523,
      subscribersTrend: 12.3,
      crashFreeRate: 99.2,
      crashFreeRateTrend: 2.1,
      avgRating: 4.7,
      avgRatingTrend: 0.3,
      hasErrors: true,
    });
  }
}
