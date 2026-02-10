"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Inbox,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Bug,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SupportStats } from "@/lib/data/support";

export function SupportStatsCards({ stats }: { stats: SupportStats }) {
  const cards = [
    {
      label: "Total Tickets",
      value: stats.total,
      icon: Inbox,
      color: "text-[#6366f1]",
      bgColor: "bg-[#6366f1]/10",
    },
    {
      label: "Needs Response",
      value: stats.open,
      icon: AlertTriangle,
      color: "text-[#f59e0b]",
      bgColor: "bg-[#f59e0b]/10",
    },
    {
      label: "Replied",
      value: stats.replied,
      icon: CheckCircle,
      color: "text-[#22c55e]",
      bgColor: "bg-[#22c55e]/10",
    },
    {
      label: "Critical",
      value: stats.byPriority?.critical || 0,
      icon: AlertTriangle,
      color: "text-[#ef4444]",
      bgColor: "bg-[#ef4444]/10",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="bg-[#111118] border-[#1e1e2e]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-1.5 rounded-md", card.bgColor)}>
                  <card.icon className={cn("w-3.5 h-3.5", card.color)} />
                </div>
                <span className="text-xs text-[#94a3b8]">{card.label}</span>
              </div>
              <p className={cn("text-2xl font-bold", card.color)}>
                {card.value}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export function SourceBreakdown({ stats }: { stats: SupportStats }) {
  const sources = [
    {
      label: "Reviews",
      count: stats.bySource?.review || 0,
      icon: MessageSquare,
      color: "#6366f1",
    },
    {
      label: "Sentry Errors",
      count: stats.bySource?.sentry || 0,
      icon: Bug,
      color: "#f59e0b",
    },
    {
      label: "Emails",
      count: stats.bySource?.email || 0,
      icon: Mail,
      color: "#22c55e",
    },
  ];

  const total = sources.reduce((sum, s) => sum + s.count, 0) || 1;

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-[#f1f5f9] mb-4">By Source</h3>
        <div className="space-y-3">
          {sources.map((source) => {
            const percent = ((source.count / total) * 100).toFixed(0);
            return (
              <div key={source.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <source.icon className="w-3.5 h-3.5" style={{ color: source.color }} />
                    <span className="text-xs text-[#94a3b8]">{source.label}</span>
                  </div>
                  <span className="text-xs font-medium text-[#f1f5f9]">
                    {source.count} ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-[#1e1e2e] rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="h-1.5 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function PriorityBreakdown({ stats }: { stats: SupportStats }) {
  const priorities = [
    { label: "Critical", count: stats.byPriority?.critical || 0, color: "#ef4444" },
    { label: "High", count: stats.byPriority?.high || 0, color: "#f59e0b" },
    { label: "Medium", count: stats.byPriority?.medium || 0, color: "#eab308" },
    { label: "Low", count: stats.byPriority?.low || 0, color: "#64748b" },
  ];

  const total = priorities.reduce((sum, p) => sum + p.count, 0) || 1;

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-[#f1f5f9] mb-4">By Priority</h3>
        <div className="space-y-3">
          {priorities.map((p) => {
            const percent = ((p.count / total) * 100).toFixed(0);
            return (
              <div key={p.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-xs text-[#94a3b8]">{p.label}</span>
                  </div>
                  <span className="text-xs font-medium text-[#f1f5f9]">
                    {p.count}
                  </span>
                </div>
                <div className="w-full bg-[#1e1e2e] rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="h-1.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
