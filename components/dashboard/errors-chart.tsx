"use client";

import { useEffect, useState } from "react";
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
import { AlertCircle } from "lucide-react";

interface DailyErrors {
  date: string;
  accepted: number;
}

interface ChartDataPoint {
  date: string;
  label: string;
  errors: number;
}

export function ErrorsChart() {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchErrors() {
      try {
        const res = await fetch("/api/charts/errors?days=30");
        if (!res.ok) throw new Error("Failed to fetch error data");
        const json = await res.json();

        const points: ChartDataPoint[] = (json.data as DailyErrors[]).map(
          (d) => ({
            date: d.date,
            label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            errors: d.accepted,
          })
        );

        setData(points);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchErrors();
  }, []);

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader>
        <CardTitle className="text-[#f1f5f9] flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#ef4444]" />
          Error Events (30d)
        </CardTitle>
        <p className="text-xs text-[#94a3b8]">
          Daily error events from Sentry
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
            <div className="animate-pulse text-sm">Loading error data…</div>
          </div>
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
            <p className="text-sm">No error data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                style={{ fontSize: "11px" }}
                interval={Math.max(0, Math.floor(data.length / 8))}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: "11px" }}
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
                  "Errors",
                ]}
              />
              <Bar
                dataKey="errors"
                fill="#ef4444"
                radius={[2, 2, 0, 0]}
                name="Errors"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
