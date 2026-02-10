"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Users,
  Calendar,
  Activity,
  Clock,
  TrendingUp,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { DAUChart } from "@/components/analytics/dau-chart";
import { RetentionCard } from "@/components/analytics/retention-card";
import { SessionsChart } from "@/components/analytics/sessions-chart";
import { TopEventsTable } from "@/components/analytics/top-events-table";

interface DailyMetric {
  date: string;
  value: number;
}

interface ActiveUsers {
  dau: number;
  wau: number;
  mau: number;
  dauTrend: DailyMetric[];
  wauTrend: DailyMetric[];
  mauTrend: DailyMetric[];
}

interface RetentionData {
  d1: number;
  d7: number;
  d30: number;
}

interface TopEvent {
  event: string;
  count: number;
  uniqueUsers: number;
}

interface SessionStats {
  totalSessions: number;
  avgSessionDuration: number;
  sessionsPerUser: number;
  dailySessions: DailyMetric[];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function KPISkeleton() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f1f5f9]">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] bg-[#111118]" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[350px] bg-[#111118]" />
        <Skeleton className="h-[350px] bg-[#111118]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[350px] bg-[#111118]" />
        <Skeleton className="h-[350px] bg-[#111118]" />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUsers | null>(null);
  const [retention, setRetention] = useState<RetentionData | null>(null);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [sessions, setSessions] = useState<SessionStats | null>(null);

  useEffect(() => {
    async function fetchAll() {
      const errs: string[] = [];

      const [usersRes, retentionRes, eventsRes, sessionsRes] =
        await Promise.allSettled([
          fetch("/api/analytics/active-users?days=30").then((r) => r.json()),
          fetch("/api/analytics/retention").then((r) => r.json()),
          fetch("/api/analytics/top-events?days=7&limit=15").then((r) => r.json()),
          fetch("/api/analytics/sessions?days=30").then((r) => r.json()),
        ]);

      if (usersRes.status === "fulfilled" && !usersRes.value.error) {
        setActiveUsers(usersRes.value);
      } else {
        errs.push("Active users data unavailable");
      }

      if (retentionRes.status === "fulfilled" && !retentionRes.value.error) {
        setRetention(retentionRes.value);
      } else {
        errs.push("Retention data unavailable");
      }

      if (eventsRes.status === "fulfilled" && !eventsRes.value.error) {
        setTopEvents(Array.isArray(eventsRes.value) ? eventsRes.value : []);
      } else {
        errs.push("Top events data unavailable");
      }

      if (sessionsRes.status === "fulfilled" && !sessionsRes.value.error) {
        setSessions(sessionsRes.value);
      } else {
        errs.push("Session data unavailable");
      }

      setErrors(errs);
      setLoading(false);
    }

    fetchAll();
  }, []);

  if (loading) return <KPISkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f1f5f9]">Analytics</h1>

      {errors.length > 0 && (
        <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="w-4 h-4 text-[#f59e0b] shrink-0" />
            <span className="text-sm text-[#f59e0b]">
              {errors.join(" · ")}
            </span>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#6366f1]" />
                <span className="text-xs text-[#94a3b8]">DAU</span>
              </div>
              <p className="text-2xl font-bold text-[#6366f1]">
                {formatNumber(activeUsers?.dau || 0)}
              </p>
              <p className="text-xs text-[#64748b] mt-1">Daily active users</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#22c55e]" />
                <span className="text-xs text-[#94a3b8]">MAU</span>
              </div>
              <p className="text-2xl font-bold text-[#22c55e]">
                {formatNumber(activeUsers?.mau || 0)}
              </p>
              <p className="text-xs text-[#64748b] mt-1">Monthly active users</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-xs text-[#94a3b8]">Sessions (30d)</span>
              </div>
              <p className="text-2xl font-bold text-[#f59e0b]">
                {formatNumber(sessions?.totalSessions || 0)}
              </p>
              <p className="text-xs text-[#64748b] mt-1">
                {sessions?.sessionsPerUser || 0} per user
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[#a78bfa]" />
                <span className="text-xs text-[#94a3b8]">Avg Session</span>
              </div>
              <p className="text-2xl font-bold text-[#a78bfa]">
                {formatDuration(sessions?.avgSessionDuration || 0)}
              </p>
              <p className="text-xs text-[#64748b] mt-1">Average duration</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1: DAU trend + Retention */}
      <div className="grid gap-6 md:grid-cols-2">
        <DAUChart
          data={activeUsers?.dauTrend || []}
          title="Daily Active Users (30d)"
          color="#6366f1"
        />
        <RetentionCard
          d1={retention?.d1 || 0}
          d7={retention?.d7 || 0}
          d30={retention?.d30 || 0}
        />
      </div>

      {/* Charts Row 2: Sessions + WAU */}
      <div className="grid gap-6 md:grid-cols-2">
        <SessionsChart data={sessions?.dailySessions || []} />
        <DAUChart
          data={activeUsers?.mauTrend || []}
          title="Monthly Active Users"
          color="#22c55e"
          icon={<TrendingUp className="w-5 h-5 text-[#22c55e]" />}
        />
      </div>

      {/* Top Events */}
      <TopEventsTable events={topEvents} />
    </div>
  );
}
