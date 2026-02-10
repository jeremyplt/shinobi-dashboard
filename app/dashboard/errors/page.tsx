"use client";

import { useEffect, useState } from "react";
import { ErrorList } from "@/components/errors/error-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Shield } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/utils";

interface SentryIssue {
  id: string;
  title: string;
  count: number;
  userCount: number;
  lastSeen: string;
  firstSeen: string;
  level: string;
  culprit: string;
}

interface DailyErrors {
  date: string;
  accepted: number;
}

interface DailyCrashRate {
  date: string;
  crashRate: number;
  userPerceivedCrashRate: number;
}

export default function ErrorsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [issues, setIssues] = useState<SentryIssue[]>([]);
  const [errorHistory, setErrorHistory] = useState<DailyErrors[]>([]);
  const [crashHistory, setCrashHistory] = useState<DailyCrashRate[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sentryRes, errorsRes, crashesRes] = await Promise.all([
          fetch("/api/sentry"),
          fetch("/api/charts/errors?days=90"),
          fetch("/api/charts/crashes?days=90"),
        ]);

        const sentryData = await sentryRes.json();
        const errorsData = await errorsRes.json();
        const crashesData = await crashesRes.json();

        setIssues(sentryData.issues || []);
        setErrorHistory(errorsData.data || []);
        setCrashHistory(crashesData.crashRates || []);
        setError(!!sentryData.error);
      } catch (err) {
        console.error("Failed to fetch errors:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Errors & Crashes</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px] bg-[#111118]" />
          <Skeleton className="h-[400px] bg-[#111118]" />
        </div>
        <Skeleton className="h-[400px] bg-[#111118]" />
      </div>
    );
  }

  const errorChartData = errorHistory.map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    errors: d.accepted,
  }));

  const crashChartData = crashHistory.map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    crashFreeRate:
      Math.round((1 - d.userPerceivedCrashRate) * 10000) / 100,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f1f5f9]">Errors & Crashes</h1>

      {error && (
        <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-sm text-[#f59e0b]">
              Some API connections failed — showing partial data
            </span>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Error Events (90d) */}
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-[#f1f5f9] text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#ef4444]" />
              Sentry Error Events (90d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={errorChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    style={{ fontSize: "10px" }}
                    interval={Math.max(
                      0,
                      Math.floor(errorChartData.length / 8)
                    )}
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
                    formatter={(v: number | undefined) => [
                      formatNumber(v ?? 0),
                      "Error Events",
                    ]}
                  />
                  <Bar dataKey="errors" fill="#ef4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Crash-Free Rate (90d) */}
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-[#f1f5f9] text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#22c55e]" />
              Android Crash-Free Rate (90d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {crashChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={crashChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    style={{ fontSize: "10px" }}
                    interval={Math.max(
                      0,
                      Math.floor(crashChartData.length / 8)
                    )}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    style={{ fontSize: "10px" }}
                    domain={["dataMin - 0.5", 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111118",
                      border: "1px solid #1e1e2e",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                    }}
                    formatter={(v: number | undefined) => [
                      `${(v ?? 0).toFixed(2)}%`,
                      "Crash-Free",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="crashFreeRate"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unresolved Issues */}
      <ErrorList issues={issues} />
    </div>
  );
}
