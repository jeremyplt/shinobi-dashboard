"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  TrendingUp,
  Star,
  Zap,
  X,
} from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Alert {
  id: string;
  type: "warning" | "success" | "info";
  icon: React.ReactNode;
  message: string;
}

interface AlertsProps {
  stats: {
    mrr: number;
    crashFreeRate: number;
    avgRating: number;
    totalErrors: number;
    newUsersToday: number;
  };
}

export function DashboardAlerts({ stats }: AlertsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const alerts: Alert[] = [];

  // MRR milestone check
  if (stats.mrr > 0 && stats.mrr >= 10000 && stats.mrr < 15000) {
    alerts.push({
      id: "mrr-milestone",
      type: "success",
      icon: <TrendingUp className="w-4 h-4" />,
      message: `MRR at ${formatCurrency(stats.mrr)} — over $10k! Next milestone: $15k.`,
    });
  }

  // Crash rate alert
  if (stats.crashFreeRate > 0 && stats.crashFreeRate < 99) {
    alerts.push({
      id: "crash-rate",
      type: "warning",
      icon: <AlertTriangle className="w-4 h-4" />,
      message: `Crash-free rate dropped below 99% (${stats.crashFreeRate.toFixed(2)}%). Check error logs.`,
    });
  }

  // Rating drop
  if (stats.avgRating > 0 && stats.avgRating < 4.0) {
    alerts.push({
      id: "rating-drop",
      type: "warning",
      icon: <Star className="w-4 h-4" />,
      message: `Average rating is ${stats.avgRating.toFixed(1)}. Review recent negative feedback.`,
    });
  }

  // High error count
  if (stats.totalErrors > 1000) {
    alerts.push({
      id: "high-errors",
      type: "warning",
      icon: <Zap className="w-4 h-4" />,
      message: `${stats.totalErrors.toLocaleString()} error events today — investigate top issues.`,
    });
  }

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));

  if (visibleAlerts.length === 0) return null;

  const colors = {
    warning: "bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]",
    success: "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]",
    info: "bg-[#6366f1]/10 border-[#6366f1]/30 text-[#6366f1]",
  };

  return (
    <AnimatePresence>
      <div className="space-y-2">
        {visibleAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className={`border ${colors[alert.type]}`}>
              <CardContent className="flex items-center justify-between py-2.5 px-4">
                <div className="flex items-center gap-2">
                  {alert.icon}
                  <span className="text-sm">{alert.message}</span>
                </div>
                <button
                  onClick={() => setDismissed((prev) => new Set([...prev, alert.id]))}
                  className="p-1 hover:bg-white/10 rounded transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
