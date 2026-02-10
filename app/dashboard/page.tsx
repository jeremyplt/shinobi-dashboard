import { KPICards } from "@/components/dashboard/kpi-cards";
import { DashboardMRRChart } from "@/components/dashboard/mrr-chart";
import { UserGrowthChart } from "@/components/dashboard/user-chart";
import { ReviewsSummary } from "@/components/dashboard/reviews-summary";
import { ErrorsSummary } from "@/components/dashboard/errors-summary";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { fetchStats } from "@/lib/data/stats";
import { fetchRevenueHistory } from "@/lib/data/revenue";

export default async function DashboardPage() {
  // Fetch data directly (no self-fetch antipattern)
  const stats = await fetchStats();
  const revenueData = await fetchRevenueHistory();

  const hasErrors = !!stats.error || !!revenueData.error;

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {hasErrors && (
        <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-sm text-[#f59e0b]">
              {stats.error || revenueData.error}
            </span>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <KPICards stats={stats} />

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <DashboardMRRChart data={revenueData.mrrHistory} />
        <UserGrowthChart data={revenueData.subscribersHistory} />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <ReviewsSummary />
        <ErrorsSummary />
      </div>
    </div>
  );
}
