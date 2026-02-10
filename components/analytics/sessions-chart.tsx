"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/utils";
import { Activity } from "lucide-react";

interface DailyMetric {
  date: string;
  value: number;
}

interface SessionsChartProps {
  data: DailyMetric[];
}

export function SessionsChart({ data }: SessionsChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    sessions: d.value,
  }));

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#f1f5f9] text-base flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#22c55e]" />
          Daily Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-[#94a3b8]">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
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
                tickFormatter={(v) => formatNumber(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111118",
                  border: "1px solid #1e1e2e",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                formatter={(v: number | undefined) => [formatNumber(v ?? 0), "Sessions"]}
              />
              <Bar dataKey="sessions" fill="#22c55e" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
