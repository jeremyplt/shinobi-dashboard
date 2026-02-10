"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  DollarSign,
  TrendingUp,
  Users,
  RefreshCw,
  Zap,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface DailyRevenue {
  date: string;
  revenue: number;
  newSubscriptions: number;
  renewals: number;
  cancellations: number;
  churns: number;
}

interface OverviewData {
  mrr: number;
  subscribers: number;
  revenue28d: number;
  activeTrials: number;
}

interface MRRDataPoint {
  date: string;
  mrr: number;
  subscribers: number;
}

interface ChurnDataPoint {
  date: string;
  churnRate: number;
  churned: number;
  activeStart: number;
}

interface ConversionDataPoint {
  date: string;
  conversionRate: number;
  trialsStarted: number;
  trialsConverted: number;
}

interface ARPUDataPoint {
  date: string;
  arpu: number;
  totalRevenue: number;
  activeUsers: number;
}

interface RevenueByCountry {
  country: string;
  revenue: number;
  percentage: number;
  transactions: number;
}

interface LTVEstimate {
  avgSubscriptionDuration: number;
  avgMonthlyRevenue: number;
  estimatedLTV: number;
}

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<DailyRevenue[]>([]);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [mrrEvolution, setMrrEvolution] = useState<MRRDataPoint[]>([]);
  const [churnData, setChurnData] = useState<ChurnDataPoint[]>([]);
  const [conversionData, setConversionData] = useState<ConversionDataPoint[]>([]);
  const [arpuData, setArpuData] = useState<ARPUDataPoint[]>([]);
  const [revenueByCountry, setRevenueByCountry] = useState<RevenueByCountry[]>([]);
  const [ltvData, setLtvData] = useState<LTVEstimate | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          revenueRes,
          statsRes,
          mrrRes,
          churnRes,
          conversionRes,
          arpuRes,
          countryRes,
          ltvRes
        ] = await Promise.all([
          fetch("/api/charts/revenue"),
          fetch("/api/stats"),
          fetch("/api/charts/mrr-evolution"),
          fetch("/api/charts/churn-rate"),
          fetch("/api/charts/conversion-rate"),
          fetch("/api/analytics/arpu"),
          fetch("/api/analytics/revenue-by-country"),
          fetch("/api/analytics/ltv"),
        ]);

        if (!revenueRes.ok) throw new Error("Failed to fetch revenue data");
        if (!statsRes.ok) throw new Error("Failed to fetch stats");

        const revenueJson = await revenueRes.json();
        const statsJson = await statsRes.json();
        const mrrJson = await mrrRes.json();
        const churnJson = await churnRes.json();
        const conversionJson = await conversionRes.json();
        const arpuJson = await arpuRes.json();
        const countryJson = await countryRes.json();
        const ltvJson = await ltvRes.json();

        setRevenueData(revenueJson.data || []);
        setOverview({
          mrr: statsJson.mrr || 0,
          subscribers: statsJson.subscribers || 0,
          revenue28d: statsJson.revenue28d || 0,
          activeTrials: statsJson.activeTrials || 0,
        });
        setMrrEvolution(mrrJson.data || []);
        setChurnData(churnJson.data || []);
        setConversionData(conversionJson.data || []);
        setArpuData(arpuJson.data || []);
        setRevenueByCountry(countryJson.data || []);
        setLtvData(ltvJson.data || null);

        if (revenueJson.error) setError(revenueJson.error);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Revenue</h1>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] bg-[#111118]" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px] bg-[#111118]" />
          <Skeleton className="h-[400px] bg-[#111118]" />
        </div>
      </div>
    );
  }

  // Process data for charts
  const revenueChartData = revenueData.map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    revenue: d.revenue / 100,
  }));

  const subscriptionChartData = revenueData.map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    newSubs: d.newSubscriptions,
    renewals: d.renewals,
    cancellations: -d.cancellations,
    churns: -d.churns,
  }));

  // Calculate cumulative subscribers
  let cumulativeSubs = 0;
  const subscriberGrowthData = revenueData.map((d) => {
    cumulativeSubs += d.newSubscriptions - d.churns;
    return {
      date: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      net: cumulativeSubs,
    };
  });

  // Calculate total revenue
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0) / 100;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f1f5f9]">Revenue</h1>

      {error && (
        <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-sm text-[#f59e0b]">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Revenue KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-[#22c55e]" />
                <span className="text-xs text-[#94a3b8]">MRR</span>
              </div>
              <p className="text-2xl font-bold text-[#22c55e]">
                {formatCurrency(overview?.mrr || 0)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#6366f1]" />
                <span className="text-xs text-[#94a3b8]">
                  Active Subscribers
                </span>
              </div>
              <p className="text-2xl font-bold text-[#f1f5f9]">
                {formatNumber(overview?.subscribers || 0)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#6366f1]" />
                <span className="text-xs text-[#94a3b8]">
                  Total Revenue (tracked)
                </span>
              </div>
              <p className="text-2xl font-bold text-[#f1f5f9]">
                {formatCurrency(totalRevenue)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-xs text-[#94a3b8]">Active Trials</span>
              </div>
              <p className="text-2xl font-bold text-[#f59e0b]">
                {formatNumber(overview?.activeTrials || 0)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* MRR Evolution Chart (Full Width) */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-[#f1f5f9] text-base flex items-center justify-between">
            <span>Current MRR (from RevenueCat API)</span>
            <span className="text-sm text-[#94a3b8] font-normal">
              Goal: $30,000/mo
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mrrEvolution.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-5xl font-bold text-[#22c55e] mb-2">
                    {formatCurrency(mrrEvolution[0].mrr / 100)}
                  </p>
                  <p className="text-sm text-[#94a3b8]">
                    {mrrEvolution[0].subscribers.toLocaleString()} active subscribers
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-4 italic">
                    📊 Historical MRR tracking coming soon
                  </p>
                </div>
              </div>
              <div className="w-full bg-[#1e1e2e] rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min((mrrEvolution[0].mrr / 100 / 30000) * 100, 100)}%`,
                  }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="bg-gradient-to-r from-[#6366f1] to-[#22c55e] h-3 rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs text-[#94a3b8]">
                <span>$0</span>
                <span className="text-[#f59e0b]">Goal: $30,000</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#94a3b8]">
              No MRR data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts - Only show if data exists */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Churn Rate - Hidden: Requires daily snapshot data */}
        {churnData.length > 0 && (
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardHeader>
              <CardTitle className="text-[#f1f5f9] text-base">
                Weekly Churn Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={churnData.map((d) => ({
                  date: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  }),
                  churnRate: d.churnRate,
                  churned: d.churned,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    style={{ fontSize: "11px" }}
                    interval={Math.max(0, Math.floor(churnData.length / 8))}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    style={{ fontSize: "11px" }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111118",
                      border: "1px solid #1e1e2e",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                    }}
                    formatter={(v: number | undefined, name: string | undefined) => {
                      if (name === "Churn Rate") return [`${(v ?? 0).toFixed(2)}%`, name ?? ""];
                      return [v ?? 0, name ?? ""];
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="churnRate"
                    name="Churn Rate"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Conversion Rate - Hidden: App doesn't use trials */}
        {conversionData.length > 0 && (
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardHeader>
              <CardTitle className="text-[#f1f5f9] text-base">
                Trial → Paid Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={conversionData.map((d) => ({
                  date: d.date,
                  conversionRate: d.conversionRate,
                  trialsStarted: d.trialsStarted,
                  trialsConverted: d.trialsConverted,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    style={{ fontSize: "11px" }}
                    interval={Math.max(0, Math.floor(conversionData.length / 6))}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    style={{ fontSize: "11px" }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111118",
                      border: "1px solid #1e1e2e",
                      borderRadius: "8px",
                      color: "#f1f5f9",
                    }}
                    formatter={(v: number | undefined, name: string | undefined) => {
                      if (name === "Conversion Rate") return [`${(v ?? 0).toFixed(2)}%`, name ?? ""];
                      return [v ?? 0, name ?? ""];
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="conversionRate"
                    name="Conversion Rate"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: "#6366f1", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Daily Revenue */}
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-[#f1f5f9] text-base">
              Daily Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  style={{ fontSize: "11px" }}
                  interval={Math.max(
                    0,
                    Math.floor(revenueChartData.length / 10)
                  )}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: "11px" }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111118",
                    border: "1px solid #1e1e2e",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                  formatter={(v: number | undefined) => [formatCurrency(v ?? 0), "Revenue"]}
                />
                <Bar
                  dataKey="revenue"
                  fill="#22c55e"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Net Subscriber Growth */}
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-[#f1f5f9] text-base">
              Net Subscriber Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={subscriberGrowthData}>
                <defs>
                  <linearGradient
                    id="colorNetSubs"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  style={{ fontSize: "11px" }}
                  interval={Math.max(
                    0,
                    Math.floor(subscriberGrowthData.length / 10)
                  )}
                />
                <YAxis stroke="#94a3b8" style={{ fontSize: "11px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111118",
                    border: "1px solid #1e1e2e",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                  formatter={(v: number | undefined) => [formatNumber(v ?? 0), "Net Subscribers"]}
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#colorNetSubs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Events */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-[#f1f5f9] text-base">
            Daily Subscription Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={subscriptionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: "11px" }}
                interval={Math.max(
                  0,
                  Math.floor(subscriptionChartData.length / 10)
                )}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: "11px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111118",
                  border: "1px solid #1e1e2e",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
              <Legend />
              <Bar
                dataKey="newSubs"
                name="New Subscriptions"
                fill="#22c55e"
                stackId="positive"
              />
              <Bar
                dataKey="renewals"
                name="Renewals"
                fill="#6366f1"
                stackId="positive"
              />
              <Bar
                dataKey="cancellations"
                name="Cancellations"
                fill="#f59e0b"
                stackId="negative"
              />
              <Bar
                dataKey="churns"
                name="Expirations"
                fill="#ef4444"
                stackId="negative"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ARPU Chart */}
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-[#f1f5f9] text-base">
              ARPU (Average Revenue Per User)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {arpuData.length > 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-5xl font-bold text-[#6366f1] mb-2">
                    {formatCurrency(arpuData[0].arpu / 100)}
                  </p>
                  <p className="text-sm text-[#94a3b8]">per month per subscriber</p>
                  <p className="text-xs text-[#94a3b8] mt-2">
                    {formatCurrency(arpuData[0].totalRevenue / 100)} MRR ÷{" "}
                    {arpuData[0].activeUsers.toLocaleString()} subscribers
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-4 italic">
                    📊 Historical ARPU tracking coming soon
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[#94a3b8]">
                No ARPU data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Country (Currency) */}
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader>
            <CardTitle className="text-[#f1f5f9] text-base">
              Revenue by Currency (Last 90d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueByCountry.slice(0, 8).map((item, i) => (
                <div key={item.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: [
                          "#22c55e",
                          "#6366f1",
                          "#f59e0b",
                          "#ef4444",
                          "#8b5cf6",
                          "#ec4899",
                          "#06b6d4",
                          "#84cc16",
                        ][i % 8],
                      }}
                    />
                    <span className="text-sm text-[#f1f5f9] font-medium">
                      {item.country}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#f1f5f9] font-medium">
                      {formatCurrency(item.revenue / 100)}
                    </div>
                    <div className="text-xs text-[#94a3b8]">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LTV Stats */}
      {ltvData && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#6366f1]" />
                <span className="text-xs text-[#94a3b8]">Avg Subscription Duration</span>
              </div>
              <p className="text-2xl font-bold text-[#f1f5f9]">
                {ltvData.avgSubscriptionDuration} days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-[#22c55e]" />
                <span className="text-xs text-[#94a3b8]">Avg Monthly Revenue</span>
              </div>
              <p className="text-2xl font-bold text-[#22c55e]">
                {formatCurrency(ltvData.avgMonthlyRevenue / 100)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#6366f1]" />
                <span className="text-xs text-[#94a3b8]">Estimated LTV</span>
              </div>
              <p className="text-2xl font-bold text-[#6366f1]">
                {formatCurrency(ltvData.estimatedLTV / 100)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MRR Goal Progress */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-[#f1f5f9] text-base">
            MRR Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#94a3b8]">Current MRR</span>
              <span className="text-[#f1f5f9] font-medium">
                {formatCurrency(overview?.mrr || 0)}
              </span>
            </div>
            <div className="w-full bg-[#1e1e2e] rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(((overview?.mrr || 0) / 30000) * 100, 100)}%`,
                }}
                transition={{ delay: 0.5, duration: 1 }}
                className="bg-gradient-to-r from-[#6366f1] to-[#22c55e] h-3 rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-[#94a3b8]">
              <span>$0</span>
              <span className="text-[#f59e0b]">Goal: $30,000</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
