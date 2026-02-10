import { KPICards } from "@/components/dashboard/kpi-cards";
import { DashboardMRRChart } from "@/components/dashboard/mrr-chart";
import { UserGrowthChart } from "@/components/dashboard/user-chart";
import { ReviewsSummary } from "@/components/dashboard/reviews-summary";
import { ErrorsSummary } from "@/components/dashboard/errors-summary";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { fetchStats } from "@/lib/data/stats";

export default async function DashboardPage() {
  const stats = await fetchStats();

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {stats.error && (
        <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-sm text-[#f59e0b]">{stats.error}</span>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <KPICards stats={stats} />

      {/* Charts — fetch historical data client-side */}
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
