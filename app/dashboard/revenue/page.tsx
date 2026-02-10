"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { RevenueHistoryChart } from "@/components/revenue/revenue-history-chart";
import { SubscriptionsChart } from "@/components/revenue/subscriptions-chart";
import { MRREvolutionChart } from "@/components/revenue/mrr-evolution-chart";
import { PlanBreakdownChart } from "@/components/revenue/plan-breakdown-chart";

interface OverviewData {
  mrr: number;
  subscribers: number;
  revenue28d: number;
  activeTrials: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  newSubscriptions: number;
  renewals: number;
  cancellations: number;
  churns: number;
}

interface ARPUDataPoint {
  arpu: number;
  totalRevenue: number;
  activeUsers: number;
}

function RevenuePageSkeleton() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f1f5f9]">Revenue</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] bg-[#111118]" />
        ))}
      </div>
      <Skeleton className="h-[350px] bg-[#111118]" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[350px] bg-[#111118]" />
        <Skeleton className="h-[350px] bg-[#111118]" />
      </div>
    </div>
  );
}

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [arpuData, setArpuData] = useState<ARPUDataPoint[]>([]);
  const [revenueHistory, setRevenueHistory] = useState<DailyRevenue[]>([]);

  useEffect(() => {
    async function fetchData() {
      const errs: string[] = [];
      
      const [statsRes, arpuRes, historyRes] = await Promise.allSettled([
        fetch("/api/stats").then((r) => r.json()),
        fetch("/api/analytics/arpu").then((r) => r.json()),
        fetch("/api/charts/revenue-history?days=90").then((r) => r.json()),
      ]);

      if (statsRes.status === "fulfilled") {
        setOverview({
          mrr: statsRes.value.mrr || 0,
          subscribers: statsRes.value.subscribers || 0,
          revenue28d: statsRes.value.revenue28d || 0,
          activeTrials: statsRes.value.activeTrials || 0,
        });
      } else {
        errs.push("Stats unavailable");
      }

      if (arpuRes.status === "fulfilled" && !arpuRes.value.error) {
        setArpuData(arpuRes.value.data || []);
      }

      if (historyRes.status === "fulfilled" && !historyRes.value.error) {
        setRevenueHistory(historyRes.value.data || []);
      } else {
        errs.push("Historical data unavailable");
      }

      setErrors(errs);
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) return <RevenuePageSkeleton />;

  const arpu = arpuData.length > 0 ? arpuData[0].arpu / 100 : 0;
  const mrrGoalPercent = Math.min(((overview?.mrr || 0) / 30000) * 100, 100);
  const dailyAvgRevenue = (overview?.revenue28d || 0) / 28;
  const annualRunRate = (overview?.mrr || 0) * 12;

  // Calculate period stats from history
  const totalRevenue90d = revenueHistory.reduce((sum, d) => sum + d.revenue, 0) / 100;
  const totalNewSubs90d = revenueHistory.reduce((sum, d) => sum + d.newSubscriptions, 0);
  const totalChurns90d = revenueHistory.reduce((sum, d) => sum + d.churns, 0);
  const netGrowth90d = totalNewSubs90d - totalChurns90d;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Revenue</h1>
        <div className="flex items-center gap-2 text-xs text-[#64748b]">
          <Clock className="w-3.5 h-3.5" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {errors.length > 0 && (
        <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="w-4 h-4 text-[#f59e0b] shrink-0" />
            <span className="text-sm text-[#f59e0b]">
              {errors.join(" · ")}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Top KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#22c55e]" />
                  <span className="text-xs text-[#94a3b8]">MRR</span>
                </div>
                <span className="text-xs text-[#64748b]">
                  ARR: {formatCurrency(annualRunRate)}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#22c55e]">
                {formatCurrency(overview?.mrr || 0)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#6366f1]" />
                  <span className="text-xs text-[#94a3b8]">Subscribers</span>
                </div>
                <div className="flex items-center gap-1">
                  {netGrowth90d >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 text-[#22c55e]" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-[#ef4444]" />
                  )}
                  <span className={`text-xs ${netGrowth90d >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                    {netGrowth90d >= 0 ? "+" : ""}{formatNumber(netGrowth90d)} (90d)
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold text-[#6366f1]">
                {formatNumber(overview?.subscribers || 0)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-xs text-[#94a3b8]">Revenue (28d)</span>
              </div>
              <p className="text-2xl font-bold text-[#f59e0b]">
                {formatCurrency(overview?.revenue28d || 0)}
              </p>
              <p className="text-xs text-[#64748b] mt-1">
                ~{formatCurrency(dailyAvgRevenue)}/day
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#a78bfa]" />
                <span className="text-xs text-[#94a3b8]">ARPU</span>
              </div>
              <p className="text-2xl font-bold text-[#a78bfa]">
                {formatCurrency(arpu)}
              </p>
              <p className="text-xs text-[#64748b] mt-1">
                per month per subscriber
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* MRR Goal Progress */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#6366f1]" />
              <span className="text-sm font-medium text-[#f1f5f9]">MRR Goal Progress</span>
            </div>
            <span className="text-sm text-[#94a3b8]">Goal: $30,000/mo</span>
          </div>

          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-[#22c55e]">
                {formatCurrency(overview?.mrr || 0)}
              </p>
              <p className="text-xs text-[#94a3b8] mt-1">Current MRR</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#f59e0b]">
                {formatCurrency(30000 - (overview?.mrr || 0))}
              </p>
              <p className="text-xs text-[#94a3b8] mt-1">Remaining</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#6366f1]">
                {mrrGoalPercent.toFixed(1)}%
              </p>
              <p className="text-xs text-[#94a3b8] mt-1">Complete</p>
            </div>
          </div>

          <div className="w-full bg-[#1e1e2e] rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${mrrGoalPercent}%` }}
              transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
              className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#22c55e] h-4 rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/10 animate-pulse rounded-full" />
            </motion.div>
          </div>
          <div className="flex justify-between text-xs text-[#64748b] mt-2">
            <span>$0</span>
            <span>$10k</span>
            <span>$20k</span>
            <span className="text-[#f59e0b] font-medium">$30k</span>
          </div>
        </CardContent>
      </Card>

      {/* MRR Evolution (from daily snapshots) */}
      <MRREvolutionChart />

      {/* Revenue History Chart (from Firestore events) */}
      <RevenueHistoryChart data={revenueHistory} />

      {/* Plan Breakdown + Subscription Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <PlanBreakdownChart />
        <SubscriptionsChart data={revenueHistory} />
      </div>

      {/* Period Summary */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#f1f5f9] text-base">
              90-Day Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94a3b8]">Total Revenue</span>
              <span className="text-sm font-bold text-[#22c55e]">
                {formatCurrency(totalRevenue90d)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94a3b8]">New Subscriptions</span>
              <span className="text-sm font-bold text-[#6366f1]">
                {formatNumber(totalNewSubs90d)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94a3b8]">Churns</span>
              <span className="text-sm font-bold text-[#ef4444]">
                {formatNumber(totalChurns90d)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#1e1e2e]">
              <span className="text-sm text-[#94a3b8]">Net Growth</span>
              <span className={`text-sm font-bold ${netGrowth90d >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                {netGrowth90d >= 0 ? "+" : ""}{formatNumber(netGrowth90d)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94a3b8]">Active Trials</span>
              <span className="text-sm font-bold text-[#f59e0b]">
                {overview?.activeTrials || 0}
              </span>
            </div>

            <div className="pt-3 border-t border-[#1e1e2e]">
              <p className="text-xs text-[#64748b]">
                Data sourced from RevenueCat API (overview) and Firestore events (history).
              </p>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
