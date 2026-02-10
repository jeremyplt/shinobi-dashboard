"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Users,
  Shield,
  Star,
  UserPlus,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  index: number;
}

function KPICard({ title, value, subtitle, icon, color, index }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-[#111118] border-[#1e1e2e] hover:border-[#6366f1]/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#94a3b8]">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg bg-opacity-10`} style={{ backgroundColor: `${color}15` }}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#f1f5f9] mb-1">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-[#94a3b8]">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface KPICardsProps {
  stats: {
    mrr: number;
    subscribers: number;
    totalUsers: number;
    newUsersToday: number;
    newUsersThisMonth: number;
    crashFreeRate: number;
    avgRating: number;
    revenue28d: number;
    activeTrials: number;
  };
}

export function KPICards({ stats }: KPICardsProps) {
  const cards = [
    {
      title: "Monthly Recurring Revenue",
      value: formatCurrency(stats.mrr),
      subtitle: `${formatCurrency(stats.revenue28d)} revenue last 28d`,
      icon: <DollarSign className="w-4 h-4" style={{ color: "#22c55e" }} />,
      color: "#22c55e",
    },
    {
      title: "Active Subscribers",
      value: formatNumber(stats.subscribers),
      subtitle: `${stats.activeTrials} active trials`,
      icon: <Users className="w-4 h-4" style={{ color: "#6366f1" }} />,
      color: "#6366f1",
    },
    {
      title: "Total Users",
      value: formatNumber(stats.totalUsers),
      subtitle: `+${formatNumber(stats.newUsersToday)} today · +${formatNumber(stats.newUsersThisMonth)} this month`,
      icon: <UserPlus className="w-4 h-4" style={{ color: "#3b82f6" }} />,
      color: "#3b82f6",
    },
    {
      title: "Crash-Free Rate",
      value: stats.crashFreeRate > 0 ? `${stats.crashFreeRate.toFixed(2)}%` : "—",
      subtitle: "Android · last 7 days avg",
      icon: <Shield className="w-4 h-4" style={{ color: "#f59e0b" }} />,
      color: "#f59e0b",
    },
    {
      title: "Average Rating",
      value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—",
      subtitle: "Across App Store & Play Store",
      icon: <Star className="w-4 h-4" style={{ color: "#f59e0b" }} />,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, index) => (
        <KPICard key={card.title} {...card} index={index} />
      ))}
    </div>
  );
}
