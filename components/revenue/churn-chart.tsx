"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingDown } from "lucide-react";

interface ChurnPoint {
  week: string;
  rate: number;
  churns: number;
  activeStart: number;
}

export function ChurnChart() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChurnPoint[]>([]);

  useEffect(() => {
    fetch("/api/charts/churn-rate?period=weekly")
      .then((r) => r.json())
      .then((res) => setData(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Skeleton className="h-[300px] bg-[#111118]" />;
  }

  if (data.length === 0) {
    return (
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#f1f5f9] text-base flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#ef4444]" />
            Churn Rate (Weekly)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-sm text-[#64748b]">No churn data available</p>
        </CardContent>
      </Card>
    );
  }

  const avgRate = data.reduce((sum, d) => sum + d.rate, 0) / data.length;

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#f1f5f9] text-base flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#ef4444]" />
            Churn Rate (Weekly)
          </CardTitle>
          <span className="text-xs text-[#64748b]">
            Avg: {avgRate.toFixed(2)}%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid stroke="#1e1e2e" strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e1e2e",
                border: "1px solid #2e2e3e",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#f1f5f9" }}
              formatter={(value: number, name: string) => {
                if (name === "rate") return [`${value.toFixed(2)}%`, "Churn Rate"];
                if (name === "churns") return [value, "Churns"];
                return [value, name];
              }}
            />
            <Bar
              dataKey="rate"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
