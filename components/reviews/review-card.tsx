"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Apple, Smartphone } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string;
    body: string;
    reviewerNickname: string;
    createdDate: string;
    platform: "ios" | "android";
    version: string;
  };
  index: number;
}

export function ReviewCard({ review, index }: ReviewCardProps) {
  const platformIcon =
    review.platform === "ios" ? (
      <Apple className="w-3.5 h-3.5" />
    ) : (
      <Smartphone className="w-3.5 h-3.5" />
    );

  const platformColor =
    review.platform === "ios"
      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
      : "bg-green-500/10 text-green-400 border-green-500/30";

  const ratingColor = (rating: number) => {
    if (rating >= 4) return "text-[#22c55e]";
    if (rating === 3) return "text-[#f59e0b]";
    return "text-[#ef4444]";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-[#111118] border-[#1e1e2e] hover:border-[#6366f1]/30 transition-colors">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${ratingColor(review.rating)}`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5"
                    fill={i < review.rating ? "currentColor" : "none"}
                    strokeWidth={i < review.rating ? 0 : 1.5}
                  />
                ))}
              </div>
              <Badge variant="outline" className={platformColor}>
                <span className="flex items-center gap-1">
                  {platformIcon}
                  {review.platform === "ios" ? "iOS" : "Android"}
                </span>
              </Badge>
            </div>
            <span className="text-xs text-[#94a3b8]">
              v{review.version}
            </span>
          </div>

          {/* Title */}
          {review.title && (
            <h3 className="text-sm font-medium text-[#f1f5f9] mb-1">
              {review.title}
            </h3>
          )}

          {/* Body */}
          <p className="text-sm text-[#94a3b8] leading-relaxed">
            {review.body}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1e1e2e]">
            <span className="text-xs text-[#94a3b8]">
              {review.reviewerNickname}
            </span>
            <span className="text-xs text-[#94a3b8]">
              {formatDate(review.createdDate)}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
