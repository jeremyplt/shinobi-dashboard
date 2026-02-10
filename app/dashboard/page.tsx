import { KPICards } from "@/components/dashboard/kpi-cards";
import { DashboardMRRChart } from "@/components/dashboard/mrr-chart";
import { UserGrowthChart } from "@/components/dashboard/user-chart";
import { ErrorsChart } from "@/components/dashboard/errors-chart";
import { CrashRateChart } from "@/components/dashboard/crash-chart";
import { ReviewsSummary } from "@/components/dashboard/reviews-summary";
import { ErrorsSummary } from "@/components/dashboard/errors-summary";
import { MRRGoalMini } from "@/components/dashboard/mrr-goal-mini";
import { DashboardAlerts } from "@/components/dashboard/alerts";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { fetchStats } from "@/lib/data/stats";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await fetchStats();

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {stats.errors.length > 0 && (
        <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="w-4 h-4 text-[#f59e0b] shrink-0" />
            <span className="text-sm text-[#f59e0b]">
              {stats.errors.join(" · ")}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Smart Alerts */}
      <DashboardAlerts stats={stats} />

      {/* KPI Cards */}
      <KPICards stats={stats} />

      {/* MRR Goal + Revenue Chart */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardMRRChart />
        </div>
        <div className="space-y-4">
          <MRRGoalMini mrr={stats.mrr} />
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#f1f5f9]">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-[#0a0a0f]">
                  <p className="text-lg font-bold text-[#22c55e]">${Math.round(stats.mrr * 12 / 1000)}k</p>
                  <p className="text-[10px] text-[#64748b]">ARR</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#0a0a0f]">
                  <p className="text-lg font-bold text-[#f59e0b]">${Math.round(stats.revenue28d / 28)}</p>
                  <p className="text-[10px] text-[#64748b]">Daily Avg</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#0a0a0f]">
                  <p className="text-lg font-bold text-[#6366f1]">{stats.activeTrials}</p>
                  <p className="text-[10px] text-[#64748b]">Active Trials</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#0a0a0f]">
                  <p className="text-lg font-bold text-[#ef4444]">{stats.totalErrors}</p>
                  <p className="text-[10px] text-[#64748b]">Errors Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Row: User Growth + Errors */}
      <div className="grid gap-4 md:grid-cols-2">
        <UserGrowthChart />
        <ErrorsChart />
      </div>

      {/* Crash Rate Chart */}
      <CrashRateChart />

      {/* Recent Activity: Reviews + Errors */}
      <div className="grid gap-4 md:grid-cols-2">
        <ReviewsSummary />
        <ErrorsSummary />
      </div>
    </div>
  );
}
