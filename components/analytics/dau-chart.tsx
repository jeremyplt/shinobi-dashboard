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
import { formatNumber } from "@/lib/utils";
import { Users } from "lucide-react";

interface DailyMetric {
  date: string;
  value: number;
}

interface DAUChartProps {
  data: DailyMetric[];
  title?: string;
  color?: string;
  icon?: React.ReactNode;
}

export function DAUChart({
  data,
  title = "Daily Active Users",
  color = "#6366f1",
  icon,
}: DAUChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: d.value,
  }));

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#f1f5f9] text-base flex items-center gap-2">
          {icon || <Users className="w-5 h-5" style={{ color }} />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-[#94a3b8]">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
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
                tickFormatter={(v) => formatNumber(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111118",
                  border: "1px solid #1e1e2e",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                formatter={(v: number | undefined) => [formatNumber(v ?? 0), "Users"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${color.replace('#', '')})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
