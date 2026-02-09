"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  trend: number;
  index: number;
  sparklineData?: number[];
}

function KPICard({ title, value, trend, index, sparklineData }: KPICardProps) {
  const isPositive = trend >= 0;

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
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#f1f5f9] mb-2">
            {value}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center text-xs font-medium ${
                isPositive ? "text-[#22c55e]" : "text-[#ef4444]"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {formatPercent(Math.abs(trend))}
            </span>
            <span className="text-xs text-[#94a3b8]">vs last month</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface KPICardsProps {
  stats: {
    mrr: number;
    mrrTrend: number;
    subscribers: number;
    subscribersTrend: number;
    crashFreeRate: number;
    crashFreeRateTrend: number;
    avgRating: number;
    avgRatingTrend: number;
  };
}

export function KPICards({ stats }: KPICardsProps) {
  const cards = [
    {
      title: "Monthly Recurring Revenue",
      value: formatCurrency(stats.mrr),
      trend: stats.mrrTrend,
    },
    {
      title: "Active Subscribers",
      value: formatNumber(stats.subscribers),
      trend: stats.subscribersTrend,
    },
    {
      title: "Crash-Free Rate",
      value: `${stats.crashFreeRate.toFixed(1)}%`,
      trend: stats.crashFreeRateTrend,
    },
    {
      title: "Average Rating",
      value: stats.avgRating.toFixed(1),
      trend: stats.avgRatingTrend,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <KPICard key={card.title} {...card} index={index} />
      ))}
    </div>
  );
}
