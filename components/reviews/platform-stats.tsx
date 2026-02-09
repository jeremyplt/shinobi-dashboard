"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface PlatformStatsProps {
  avgRating: number;
  total: number;
  iosCount: number;
  androidCount: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export function PlatformStats({
  avgRating,
  total,
  iosCount,
  androidCount,
  ratingDistribution,
}: PlatformStatsProps) {
  const maxCount = Math.max(...Object.values(ratingDistribution));

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader>
        <CardTitle className="text-[#f1f5f9]">Rating Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-[#f1f5f9] mb-2">
            {avgRating.toFixed(1)}
          </div>
          <div className="flex justify-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(avgRating)
                    ? "fill-[#f59e0b] text-[#f59e0b]"
                    : "text-[#94a3b8]"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-[#94a3b8]">{total} total reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating as keyof typeof ratingDistribution];
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-xs text-[#94a3b8] w-8 text-right">
                  {rating} <Star className="inline w-3 h-3" />
                </span>
                <div className="flex-1 h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f59e0b] rounded-full transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="text-xs text-[#94a3b8] w-12">
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>

        {/* Platform Breakdown */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1e1e2e]">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#6366f1] mb-1">
              {iosCount}
            </div>
            <p className="text-xs text-[#94a3b8]">iOS Reviews</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#22c55e] mb-1">
              {androidCount}
            </div>
            <p className="text-xs text-[#94a3b8]">Android Reviews</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
