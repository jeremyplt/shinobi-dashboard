"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface RatingStatsProps {
  avgRating: number;
  total: number;
  distribution: number[];
}

export function RatingStats({ avgRating, total, distribution }: RatingStatsProps) {
  const maxCount = Math.max(...distribution, 1);

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#f1f5f9] text-base">Rating Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-[#f1f5f9]"
            >
              {avgRating.toFixed(1)}
            </motion.div>
            <div className="flex items-center gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-3 h-3 text-[#f59e0b]"
                  fill={i < Math.round(avgRating) ? "currentColor" : "none"}
                  strokeWidth={i < Math.round(avgRating) ? 0 : 1.5}
                />
              ))}
            </div>
            <p className="text-xs text-[#94a3b8] mt-1">{total} reviews</p>
          </div>
          
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star - 1] || 0;
              const percentage = total > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-[#94a3b8] w-3">{star}</span>
                  <Star className="w-3 h-3 text-[#f59e0b]" fill="currentColor" strokeWidth={0} />
                  <div className="flex-1 h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="h-full bg-[#f59e0b] rounded-full"
                    />
                  </div>
                  <span className="text-xs text-[#94a3b8] w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
