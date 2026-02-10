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
  Bar,
  BarChart,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { DollarSign } from "lucide-react";

interface DailyRevenue {
  date: string;
  revenue: number;
  newSubscriptions: number;
  renewals: number;
  cancellations: number;
  churns: number;
}

interface ChartDataPoint {
  date: string;
  label: string;
  revenue: number;
  newSubs: number;
  renewals: number;
}

export function DashboardMRRChart() {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const res = await fetch("/api/charts/revenue");
        if (!res.ok) throw new Error("Failed to fetch revenue data");
        const json = await res.json();

        const points: ChartDataPoint[] = (json.data as DailyRevenue[]).map(
          (d) => ({
            date: d.date,
            label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            revenue: d.revenue / 100, // cents to dollars
            newSubs: d.newSubscriptions,
            renewals: d.renewals,
          })
        );

        setData(points);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchRevenue();
  }, []);

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader>
        <CardTitle className="text-[#f1f5f9] flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#22c55e]" />
          Revenue History
        </CardTitle>
        <p className="text-xs text-[#94a3b8]">
          Daily revenue from subscription events
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
            <div className="animate-pulse text-sm">Loading revenue data…</div>
          </div>
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
            <p className="text-sm">No revenue data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                style={{ fontSize: "11px" }}
                interval={Math.max(0, Math.floor(data.length / 10))}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: "11px" }}
                tickFormatter={(value) => `$${value}`}
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
                  "Revenue",
                ]}
                labelFormatter={(label) => label}
              />
              <Bar
                dataKey="revenue"
                fill="#22c55e"
                radius={[2, 2, 0, 0]}
                name="Revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
