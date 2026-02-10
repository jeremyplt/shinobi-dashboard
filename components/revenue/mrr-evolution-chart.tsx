"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface Snapshot {
  date: string;
  mrr: number;
  subscribers: number;
}

export function MRREvolutionChart() {
  const [data, setData] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSnapshots() {
      try {
        const res = await fetch("/api/snapshot?days=180");
        const json = await res.json();
        setData(json.data || []);
      } catch (err) {
        console.error("Failed to fetch MRR snapshots:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSnapshots();
  }, []);

  if (loading) {
    return <Skeleton className="h-[400px] bg-[#111118]" />;
  }

  if (data.length < 2) {
    return (
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-[#f1f5f9] text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#22c55e]" />
            MRR Evolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-[#94a3b8]">
            <p className="text-sm mb-2">Not enough snapshots yet</p>
            <p className="text-xs text-[#64748b]">
              Daily snapshots are collected automatically. Charts will appear after 2+ data points.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    mrr: d.mrr,
    subscribers: d.subscribers,
  }));

  const latestMRR = data[data.length - 1]?.mrr || 0;
  const firstMRR = data[0]?.mrr || 0;
  const growth = firstMRR > 0 ? ((latestMRR - firstMRR) / firstMRR * 100).toFixed(1) : "0";

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[#f1f5f9] text-base flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#22c55e]" />
          MRR Evolution
        </CardTitle>
        <div className="text-right">
          <p className="text-sm font-bold text-[#22c55e]">{formatCurrency(latestMRR)}</p>
          <p className="text-xs text-[#64748b]">
            {Number(growth) >= 0 ? "+" : ""}{growth}% growth
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="mrrEvolutionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              style={{ fontSize: "10px" }}
              interval={Math.max(0, Math.floor(chartData.length / 8))}
            />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: "10px" }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111118",
                border: "1px solid #1e1e2e",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
              formatter={(v: number | undefined) => [formatCurrency(v ?? 0), "MRR"]}
            />
            <ReferenceLine
              y={30000}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{ value: "Goal: $30k", position: "right", fill: "#f59e0b", fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="mrr"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#mrrEvolutionGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
