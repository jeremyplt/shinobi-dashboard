"use client";

import { useEffect, useState } from "react";
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
import { Users } from "lucide-react";

interface HistoricalMetric {
  date: string;
  active_subscribers: number | null;
}

interface ChartDataPoint {
  date: string;
  value: number;
}

export function UserGrowthChart() {
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
          .filter((m) => m.active_subscribers != null)
          .map((m) => ({
            date: new Date(m.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            value: m.active_subscribers ?? 0,
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
        <CardTitle className="text-[#f1f5f9]">Subscriber Growth</CardTitle>
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
            <Users className="w-8 h-8 text-[#22c55e] opacity-50" />
            <p className="text-sm">
              Tracking started — data will accumulate daily
            </p>
            {data.length === 1 && (
              <p className="text-xs text-[#22c55e]">
                Current subscribers: {formatNumber(data[0].value)}
              </p>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis
                dataKey="date"
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
                  "Subscribers",
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
