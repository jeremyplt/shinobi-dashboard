"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface PlanData {
  name: string;
  subscribers: number;
  revenue: number;
  type: string;
}

const COLORS: Record<string, string> = {
  monthly: "#6366f1",
  yearly: "#22c55e",
  lifetime: "#f59e0b",
  trial: "#a78bfa",
};

const TYPE_LABELS: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  lifetime: "Lifetime",
  trial: "Trial",
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function PlanBreakdownChart() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PlanData[]>([]);

  useEffect(() => {
    fetch("/api/analytics/plan-breakdown")
      .then((r) => r.json())
      .then((data) => {
        setPlans(data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Skeleton className="h-[300px] bg-[#111118]" />;
  }

  if (plans.length === 0) {
    return null;
  }

  const totalSubs = plans.reduce((sum, p) => sum + p.subscribers, 0);
  const totalRev = plans.reduce((sum, p) => sum + p.revenue, 0);

  const pieData = plans.map((p) => ({
    name: TYPE_LABELS[p.type] || p.name,
    value: p.subscribers,
    revenue: p.revenue,
    type: p.type,
  }));

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#f1f5f9] text-base">
          Subscription Plans (90d)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Donut chart */}
          <div className="w-[180px] h-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.type}
                      fill={COLORS[entry.type] || "#64748b"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#1e1e2e] border border-[#2e2e3e] rounded-lg px-3 py-2 shadow-xl">
                        <p className="text-sm font-medium text-[#f1f5f9]">{d.name}</p>
                        <p className="text-xs text-[#94a3b8]">
                          {d.value} transactions · {formatCurrency(d.revenue)}
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend + stats */}
          <div className="flex-1 space-y-3">
            {plans.map((plan, i) => {
              const percent = totalSubs > 0
                ? ((plan.subscribers / totalSubs) * 100).toFixed(1)
                : "0";
              const revPercent = totalRev > 0
                ? ((plan.revenue / totalRev) * 100).toFixed(0)
                : "0";

              return (
                <motion.div
                  key={plan.type}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: COLORS[plan.type] || "#64748b" }}
                    />
                    <span className="text-sm text-[#94a3b8]">
                      {TYPE_LABELS[plan.type] || plan.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#64748b]">
                      {plan.subscribers} txns ({percent}%)
                    </span>
                    <span className="text-xs font-medium text-[#f1f5f9]">
                      {formatCurrency(plan.revenue)}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            <div className="pt-2 border-t border-[#1e1e2e]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748b]">Total (90d)</span>
                <span className="text-sm font-bold text-[#f1f5f9]">
                  {formatCurrency(totalRev)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
