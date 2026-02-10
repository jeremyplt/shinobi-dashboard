import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.REVENUECAT_API_KEY;
    
    if (!apiKey) {
      throw new Error("REVENUECAT_API_KEY not configured");
    }

    const response = await fetch(
      "https://api.revenuecat.com/v2/projects/projc4678a43/metrics/overview",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`RevenueCat API error: ${response.status}`);
    }

    const data = await response.json();

    // RevenueCat returns metrics as an array: data.metrics[{id, value}]
    let mrr = 0, activeSubscriptions = 0, revenue = 0, activeUsers = 0;
    if (data.metrics) {
      for (const m of data.metrics) {
        if (m.id === "mrr") mrr = Math.round(m.value || 0);
        if (m.id === "active_subscriptions") activeSubscriptions = Math.round(m.value || 0);
        if (m.id === "revenue") revenue = Math.round(m.value || 0);
        if (m.id === "active_users") activeUsers = Math.round(m.value || 0);
      }
    }

    return NextResponse.json({
      mrr,
      activeSubscriptions,
      revenue,
      activeUsers,
      churn: 0,
    });
  } catch (error) {
    console.error("RevenueCat API error:", error);
    
    // Return error response (no mock data)
    return NextResponse.json({
      mrr: 0,
      activeSubscriptions: 0,
      revenue: 0,
      activeUsers: 0,
      churn: 0,
      error: "API connection failed",
    }, { status: 500 });
  }
}
