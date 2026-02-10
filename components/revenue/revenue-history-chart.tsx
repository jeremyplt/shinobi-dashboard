"use client";

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

interface DailyRevenue {
  date: string;
  revenue: number;
  newSubscriptions: number;
  renewals: number;
}

interface RevenueHistoryChartProps {
  data: DailyRevenue[];
}

export function RevenueHistoryChart({ data }: RevenueHistoryChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    revenue: d.revenue / 100, // cents to dollars
  }));

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#f1f5f9] text-base flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#22c55e]" />
          Daily Revenue (from Firestore events)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
            No historical data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: "10px" }}
                interval={Math.max(0, Math.floor(chartData.length / 10))}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: "10px" }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111118",
                  border: "1px solid #1e1e2e",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                formatter={(v: number | undefined) => [formatCurrency(v ?? 0), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
