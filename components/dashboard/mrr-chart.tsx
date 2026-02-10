"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface HistoricalMetric {
  date: string;
  mrr_cents: number | null;
}

interface ChartDataPoint {
  date: string;
  value: number;
}

export function DashboardMRRChart() {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistorical() {
      try {
        const res = await fetch("/api/historical?days=30");
        if (!res.ok) throw new Error("Failed to fetch historical data");
        const json = await res.json();
        const points: ChartDataPoint[] = (json.metrics as HistoricalMetric[])
          .filter((m) => m.mrr_cents != null)
          .map((m) => ({
            date: new Date(m.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            value: (m.mrr_cents ?? 0) / 100,
          }));
        setData(points);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchHistorical();
  }, []);

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader>
        <CardTitle className="text-[#f1f5f9]">Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
            <div className="animate-pulse text-sm">Loading chart data…</div>
          </div>
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : data.length <= 1 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-[#94a3b8] gap-2">
            <TrendingUp className="w-8 h-8 text-[#6366f1] opacity-50" />
            <p className="text-sm">
              Tracking started — data will accumulate daily
            </p>
            {data.length === 1 && (
              <p className="text-xs text-[#6366f1]">
                Current MRR: {formatCurrency(data[0].value)}
              </p>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111118",
                  border: "1px solid #1e1e2e",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                formatter={(value: number | undefined) => [
                  formatCurrency(value ?? 0),
                  "MRR",
                ]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
