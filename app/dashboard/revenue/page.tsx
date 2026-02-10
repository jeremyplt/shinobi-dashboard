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
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface OverviewData {
  mrr: number;
  subscribers: number;
  revenue28d: number;
  activeTrials: number;
}

interface ARPUDataPoint {
  arpu: number;
  totalRevenue: number;
  activeUsers: number;
}

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [arpuData, setArpuData] = useState<ARPUDataPoint[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, arpuRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/charts/arpu"),
        ]);

        const [statsJson, arpuJson] = await Promise.all([
          statsRes.json(),
          arpuRes.json(),
        ]);

        setOverview({
          mrr: statsJson.mrr || 0,
          subscribers: statsJson.subscribers || 0,
          revenue28d: statsJson.revenue28d || 0,
          activeTrials: statsJson.activeTrials || 0,
        });
        setArpuData(arpuJson.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Revenue</h1>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] bg-[#111118]" />
          ))}
        </div>
        <Skeleton className="h-[300px] bg-[#111118]" />
      </div>
    );
  }

  const arpu = arpuData.length > 0 ? arpuData[0].arpu / 100 : 0;
  const mrrGoalPercent = Math.min(((overview?.mrr || 0) / 30000) * 100, 100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f1f5f9]">Revenue</h1>

      {error && (
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="p-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Top Stats - All from RevenueCat API */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-[#22c55e]" />
              <span className="text-xs text-[#94a3b8]">MRR</span>
            </div>
            <p className="text-2xl font-bold text-[#22c55e]">
              {formatCurrency(overview?.mrr || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#6366f1]" />
              <span className="text-xs text-[#94a3b8]">Active Subscribers</span>
            </div>
            <p className="text-2xl font-bold text-[#6366f1]">
              {formatNumber(overview?.subscribers || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-xs text-[#94a3b8]">Revenue (28d)</span>
            </div>
            <p className="text-2xl font-bold text-[#f59e0b]">
              {formatCurrency(overview?.revenue28d || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[#22c55e]" />
              <span className="text-xs text-[#94a3b8]">Active Trials</span>
            </div>
            <p className="text-2xl font-bold text-[#22c55e]">
              {overview?.activeTrials || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MRR Goal Progress */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-[#f1f5f9] text-base flex items-center justify-between">
            <span>MRR Goal Progress</span>
            <span className="text-sm text-[#94a3b8] font-normal">
              Goal: $30,000/mo
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-5xl font-bold text-[#22c55e] mb-2">
                  {formatCurrency(overview?.mrr || 0)}
                </p>
                <p className="text-sm text-[#94a3b8]">
                  {formatNumber(overview?.subscribers || 0)} active subscribers
                </p>
              </div>
            </div>
            <div className="w-full bg-[#1e1e2e] rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${mrrGoalPercent}%`,
                }}
                transition={{ delay: 0.5, duration: 1 }}
                className="bg-gradient-to-r from-[#6366f1] to-[#22c55e] h-3 rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-[#94a3b8]">
              <span>$0</span>
              <span className="text-[#22c55e] font-medium">
                {mrrGoalPercent.toFixed(1)}%
              </span>
              <span className="text-[#f59e0b]">Goal: $30,000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ARPU */}
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-[#6366f1]" />
              <span className="text-sm text-[#94a3b8] font-medium">ARPU (Average Revenue Per User)</span>
            </div>
            <p className="text-4xl font-bold text-[#6366f1] mb-1">
              {formatCurrency(arpu)}
            </p>
            <p className="text-xs text-[#94a3b8]">per month per subscriber</p>
          </CardContent>
        </Card>

        {/* Revenue per 28 days breakdown */}
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#f59e0b]" />
              <span className="text-sm text-[#94a3b8] font-medium">Daily Average Revenue</span>
            </div>
            <p className="text-4xl font-bold text-[#f59e0b] mb-1">
              {formatCurrency((overview?.revenue28d || 0) / 28)}
            </p>
            <p className="text-xs text-[#94a3b8]">
              based on {formatCurrency(overview?.revenue28d || 0)} over last 28 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Historical Data Notice */}
      <Card className="bg-[#111118] border-[#1e1e2e] border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-[#94a3b8] text-sm">
            📊 <strong className="text-[#f1f5f9]">Historical charts coming soon</strong>
          </p>
          <p className="text-[#64748b] text-xs mt-2">
            Daily metric snapshots will enable MRR evolution, revenue trends, and subscriber growth charts.
            <br />
            All current data sourced from <strong>RevenueCat API</strong> (authoritative).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
