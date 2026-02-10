"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MRRGoalMiniProps {
  mrr: number;
  goal?: number;
}

export function MRRGoalMini({ mrr, goal = 30000 }: MRRGoalMiniProps) {
  const percent = Math.min((mrr / goal) * 100, 100);
  const remaining = goal - mrr;

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-[#6366f1]" />
          <span className="text-sm font-medium text-[#f1f5f9]">
            MRR Goal: {formatCurrency(goal)}
          </span>
        </div>
        <div className="flex items-end gap-3 mb-3">
          <span className="text-3xl font-bold text-[#22c55e]">
            {formatCurrency(mrr)}
          </span>
          <span className="text-sm text-[#94a3b8] mb-1">
            ({percent.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-[#1e1e2e] rounded-full h-2.5 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-[#6366f1] to-[#22c55e] h-2.5 rounded-full"
          />
        </div>
        <p className="text-xs text-[#64748b]">
          {formatCurrency(remaining)} to go · ~{Math.ceil(remaining / (mrr > 0 ? mrr * 0.05 : 1))} months at 5% growth
        </p>
      </CardContent>
    </Card>
  );
}
