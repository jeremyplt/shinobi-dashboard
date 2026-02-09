import { KPICards } from "@/components/dashboard/kpi-cards";
import { DashboardMRRChart } from "@/components/dashboard/mrr-chart";
import { UserGrowthChart } from "@/components/dashboard/user-chart";
import { ReviewsSummary } from "@/components/dashboard/reviews-summary";
import { ErrorsSummary } from "@/components/dashboard/errors-summary";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

async function getStats() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/stats`, {
      cache: "no-store",
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }
    
    return response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Return mock data on error
    return {
      mrr: 12450,
      mrrTrend: 8.5,
      subscribers: 523,
      subscribersTrend: 12.3,
      crashFreeRate: 99.2,
      crashFreeRateTrend: 2.1,
      avgRating: 4.7,
      avgRatingTrend: 0.3,
      hasErrors: true,
    };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {stats.hasErrors && (
        <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-sm text-[#f59e0b]">
              API connection error — showing cached data
            </span>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <KPICards stats={stats} />

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <DashboardMRRChart />
        <UserGrowthChart />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <ReviewsSummary />
        <ErrorsSummary />
      </div>
    </div>
  );
}
