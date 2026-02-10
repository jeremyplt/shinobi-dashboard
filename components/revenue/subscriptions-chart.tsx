"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { formatNumber } from "@/lib/utils";
import { Users } from "lucide-react";

interface DailyRevenue {
  date: string;
  newSubscriptions: number;
  renewals: number;
  cancellations: number;
  churns: number;
}

interface SubscriptionsChartProps {
  data: DailyRevenue[];
}

export function SubscriptionsChart({ data }: SubscriptionsChartProps) {
  // Aggregate weekly for cleaner visualization
  const weeklyData: { week: string; newSubs: number; renewals: number; cancellations: number; churns: number }[] = [];
  
  let currentWeek = "";
  let currentData = { newSubs: 0, renewals: 0, cancellations: 0, churns: 0 };

  for (const d of data) {
    const date = new Date(d.date + "T00:00:00");
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay() + 1); // Monday
    const weekKey = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (weekKey !== currentWeek) {
      if (currentWeek) {
        weeklyData.push({ week: currentWeek, ...currentData });
      }
      currentWeek = weekKey;
      currentData = { newSubs: 0, renewals: 0, cancellations: 0, churns: 0 };
    }

    currentData.newSubs += d.newSubscriptions;
    currentData.renewals += d.renewals;
    currentData.cancellations += d.cancellations;
    currentData.churns += d.churns;
  }
  if (currentWeek) {
    weeklyData.push({ week: currentWeek, ...currentData });
  }

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#f1f5f9] text-base flex items-center gap-2">
          <Users className="w-5 h-5 text-[#6366f1]" />
          Subscription Activity (Weekly)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {weeklyData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-[#94a3b8]">
            No subscription data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis
                dataKey="week"
                stroke="#94a3b8"
                style={{ fontSize: "10px" }}
                interval={Math.max(0, Math.floor(weeklyData.length / 8))}
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
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
              />
              <Bar dataKey="newSubs" name="New" fill="#6366f1" radius={[2, 2, 0, 0]} stackId="a" />
              <Bar dataKey="renewals" name="Renewals" fill="#22c55e" radius={[2, 2, 0, 0]} stackId="a" />
              <Bar dataKey="churns" name="Churns" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
