"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/utils";

interface ChartDataPoint {
  month: string;
  value: number;
}

interface UserGrowthChartProps {
  data: ChartDataPoint[];
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  const isEmpty = !data || data.length === 0;

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader>
        <CardTitle className="text-[#f1f5f9]">User Growth</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
            <p className="text-sm">No user data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111118",
                  border: "1px solid #1e1e2e",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                formatter={(value: number | undefined) => [
                  formatNumber(value ?? 0),
                  "Users",
                ]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
