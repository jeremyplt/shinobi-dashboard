"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

interface RetentionCardProps {
  d1: number;
  d7: number;
  d30: number;
}

function RetentionBar({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#94a3b8]">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>
          {value}%
        </span>
      </div>
      <div className="w-full bg-[#1e1e2e] rounded-full h-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ delay, duration: 0.8, ease: "easeOut" }}
          className="h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function RetentionCard({ d1, d7, d30 }: RetentionCardProps) {
  const getColor = (val: number) => {
    if (val >= 40) return "#22c55e";
    if (val >= 20) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#f1f5f9] text-base flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-[#a78bfa]" />
          User Retention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <RetentionBar label="Day 1" value={d1} color={getColor(d1)} delay={0.2} />
        <RetentionBar label="Day 7" value={d7} color={getColor(d7)} delay={0.4} />
        <RetentionBar label="Day 30" value={d30} color={getColor(d30)} delay={0.6} />

        <div className="pt-3 border-t border-[#1e1e2e]">
          <p className="text-xs text-[#64748b]">
            Based on users who return after their first event in the last 30 days.
            Industry average: D1 ~25%, D7 ~12%, D30 ~5%.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
