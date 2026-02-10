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
import { Shield } from "lucide-react";

interface DailyCrashRate {
  date: string;
  crashRate: number;
  userPerceivedCrashRate: number;
}

interface ChartDataPoint {
  date: string;
  label: string;
  crashFreeRate: number;
}

export function CrashRateChart() {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCrashes() {
      try {
        const res = await fetch("/api/charts/crashes?days=90");
        if (!res.ok) throw new Error("Failed to fetch crash data");
        const json = await res.json();

        const points: ChartDataPoint[] = (
          json.crashRates as DailyCrashRate[]
        ).map((d) => ({
          date: d.date,
          label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          crashFreeRate:
            Math.round((1 - d.userPerceivedCrashRate) * 10000) / 100,
        }));

        setData(points);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchCrashes();
  }, []);

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader>
        <CardTitle className="text-[#f1f5f9] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#f59e0b]" />
          Crash-Free Rate (Android)
        </CardTitle>
        <p className="text-xs text-[#94a3b8]">
          User-perceived crash-free rate from Google Play
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
            <div className="animate-pulse text-sm">Loading crash data…</div>
          </div>
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
            <p className="text-sm">No crash data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
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
                domain={["dataMin - 0.5", 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111118",
                  border: "1px solid #1e1e2e",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                formatter={(value: number | undefined) => [
                  `${(value ?? 0).toFixed(2)}%`,
                  "Crash-Free Rate",
                ]}
              />
              <Line
                type="monotone"
                dataKey="crashFreeRate"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="Crash-Free Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
