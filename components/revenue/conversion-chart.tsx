"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface ConversionPoint {
  week: string;
  rate: number;
  trials: number;
  conversions: number;
}

export function ConversionChart() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ConversionPoint[]>([]);

  useEffect(() => {
    fetch("/api/charts/conversion-rate")
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
            <TrendingUp className="w-4 h-4 text-[#22c55e]" />
            Trial → Paid Conversion
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-sm text-[#64748b]">No conversion data available</p>
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
            <TrendingUp className="w-4 h-4 text-[#22c55e]" />
            Trial → Paid Conversion
          </CardTitle>
          <span className="text-xs text-[#64748b]">
            Avg: {avgRate.toFixed(1)}%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="conversionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
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
                if (name === "rate") return [`${value.toFixed(1)}%`, "Conversion Rate"];
                return [value, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#22c55e"
              fill="url(#conversionGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
