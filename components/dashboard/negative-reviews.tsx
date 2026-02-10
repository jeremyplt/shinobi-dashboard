"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  reviewerNickname: string;
  body: string;
  platform: string;
  createdDate: string;
}

export function NegativeReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch("/api/reviews");
        const data = await response.json();
        // Get only 1-2 star reviews, latest first
        const negative = (data.reviews || [])
          .filter((r: Review) => r.rating <= 2)
          .sort((a: Review, b: Review) =>
            new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
          )
          .slice(0, 3);
        setReviews(negative);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  if (loading || reviews.length === 0) return null;

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[#f1f5f9] text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
          Recent Negative Reviews
        </CardTitle>
        <Link
          href="/dashboard/reviews?rating=1"
          className="text-xs text-[#6366f1] hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-2.5 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e]"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${
                      i < review.rating
                        ? "fill-[#ef4444] text-[#ef4444]"
                        : "text-[#64748b]"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#64748b]">
                {review.platform === "ios" ? "iOS" : "Android"}
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] line-clamp-2">{review.body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
