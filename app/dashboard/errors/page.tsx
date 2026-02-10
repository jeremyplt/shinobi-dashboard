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

interface DailyAnrRate {
  date: string;
  anrRate: number;
  userPerceivedAnrRate: number;
}

export default function ErrorsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [issues, setIssues] = useState<SentryIssue[]>([]);
  const [errorHistory, setErrorHistory] = useState<DailyErrors[]>([]);
  const [crashHistory, setCrashHistory] = useState<DailyCrashRate[]>([]);
  const [anrHistory, setAnrHistory] = useState<DailyAnrRate[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sentryRes, errorsRes, crashesRes, anrRes] = await Promise.all([
          fetch("/api/sentry"),
          fetch("/api/charts/errors?days=90"),
          fetch("/api/charts/crashes?days=90"),
          fetch("/api/charts/anr-rate"),
        ]);

        const sentryData = await sentryRes.json();
        const errorsData = await errorsRes.json();
        const crashesData = await crashesRes.json();
        const anrData = await anrRes.json();

        setIssues(sentryData.issues || []);
        setErrorHistory(errorsData.data || []);
        setCrashHistory(crashesData.crashRates || []);
        setAnrHistory(anrData.data || []);
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

  const anrChartData = anrHistory.map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    anrRate: d.userPerceivedAnrRate * 100,
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

      {/* KPI Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-[#ef4444]" />
              <span className="text-xs text-[#94a3b8]">Unresolved Issues</span>
            </div>
            <p className="text-2xl font-bold text-[#ef4444]">
              {formatNumber(issues.length)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-xs text-[#94a3b8]">Users Affected</span>
            </div>
            <p className="text-2xl font-bold text-[#f59e0b]">
              {formatNumber(issues.reduce((sum, i) => sum + i.userCount, 0))}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#22c55e]" />
              <span className="text-xs text-[#94a3b8]">Crash-Free Rate</span>
            </div>
            <p className="text-2xl font-bold text-[#22c55e]">
              {crashChartData.length > 0
                ? `${crashChartData[crashChartData.length - 1].crashFreeRate}%`
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-[#6366f1]" />
              <span className="text-xs text-[#94a3b8]">Events Today</span>
            </div>
            <p className="text-2xl font-bold text-[#6366f1]">
              {errorChartData.length > 0
                ? formatNumber(errorChartData[errorChartData.length - 1]?.errors || 0)
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid 1 */}
      <div className="grid gap-6 md:grid-cols-3">
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

        {/* ANR Rate (90d) */}
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-[#f1f5f9] text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
              Android ANR Rate (90d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {anrChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={anrChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    style={{ fontSize: "10px" }}
                    interval={Math.max(
                      0,
                      Math.floor(anrChartData.length / 8)
                    )}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    style={{ fontSize: "10px" }}
                    tickFormatter={(v) => `${v.toFixed(2)}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111118",
                      border: "1px solid #1e1e2e",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                    }}
                    formatter={(v: number | undefined) => [
                      `${(v ?? 0).toFixed(3)}%`,
                      "ANR Rate",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="anrRate"
                    stroke="#f59e0b"
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
