"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MRRChart } from "@/components/revenue/mrr-chart";
import { SubscriberChart } from "@/components/revenue/subscriber-chart";
import { PlanBreakdown } from "@/components/revenue/plan-breakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, DollarSign, TrendingUp, Users, RefreshCw } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface RevenueData {
  mrr: number;
  activeSubscriptions: number;
  revenue: number;
  activeUsers: number;
  churn: number;
}

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<RevenueData | null>(null);

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const response = await fetch("/api/revenue");
        const result = await response.json();
        setData(result);
        setError(!!result.error);
      } catch (err) {
        console.error("Failed to fetch revenue:", err);
        setError(true);
        // Use mock data
        setData({
          mrr: 12450,
          activeSubscriptions: 523,
          revenue: 38900,
          activeUsers: 2847,
          churn: 3.2,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchRevenue();
  }, []);

  // Generate chart data (in a real app this would come from the API)
  const mrrData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2025, i + 3, 1);
    return {
      date: month.toLocaleDateString("en-US", { month: "short" }),
      mrr: Math.round(8000 + i * 400 + Math.random() * 300),
    };
  });

  const subscriberData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2025, i + 3, 1);
    return {
      date: month.toLocaleDateString("en-US", { month: "short" }),
      subscribers: Math.round(280 + i * 25 + Math.random() * 20),
    };
  });

  const planData = [
    { name: "Monthly", value: data?.mrr ? Math.round(data.mrr * 0.34) : 4200, color: "#6366f1" },
    { name: "Annual", value: data?.mrr ? Math.round(data.mrr * 0.55) : 6800, color: "#22c55e" },
    { name: "Lifetime", value: data?.mrr ? Math.round(data.mrr * 0.11) : 1450, color: "#f59e0b" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Revenue</h1>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] bg-[#111118]" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px] bg-[#111118]" />
          <Skeleton className="h-[400px] bg-[#111118]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f1f5f9]">Revenue</h1>

      {error && (
        <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-sm text-[#f59e0b]">
              API connection error — showing sample data
            </span>
          </CardContent>
        </Card>
      )}

      {/* Revenue KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-[#22c55e]" />
                <span className="text-xs text-[#94a3b8]">MRR</span>
              </div>
              <p className="text-2xl font-bold text-[#22c55e]">
                {formatCurrency(data?.mrr || 0)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#6366f1]" />
                <span className="text-xs text-[#94a3b8]">Subscribers</span>
              </div>
              <p className="text-2xl font-bold text-[#f1f5f9]">
                {formatNumber(data?.activeSubscriptions || 0)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#6366f1]" />
                <span className="text-xs text-[#94a3b8]">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-[#f1f5f9]">
                {formatCurrency(data?.revenue || 0)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-[#ef4444]" />
                <span className="text-xs text-[#94a3b8]">Churn Rate</span>
              </div>
              <p className="text-2xl font-bold text-[#ef4444]">
                {data?.churn?.toFixed(1) || "0.0"}%
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <MRRChart data={mrrData} />
        <SubscriberChart data={subscriberData} />
      </div>

      {/* Plan Breakdown */}
      <PlanBreakdown data={planData} />

      {/* MRR Goal Progress */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-[#f1f5f9] text-base">
            MRR Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#94a3b8]">Current MRR</span>
              <span className="text-[#f1f5f9] font-medium">
                {formatCurrency(data?.mrr || 0)}
              </span>
            </div>
            <div className="w-full bg-[#1e1e2e] rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(((data?.mrr || 0) / 30000) * 100, 100)}%`,
                }}
                transition={{ delay: 0.5, duration: 1 }}
                className="bg-gradient-to-r from-[#6366f1] to-[#22c55e] h-3 rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-[#94a3b8]">
              <span>$0</span>
              <span className="text-[#f59e0b]">Goal: $30,000</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
