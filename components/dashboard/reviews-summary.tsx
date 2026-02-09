"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Review {
  id: string;
  rating: number;
  reviewerNickname: string;
  body: string;
  platform: string;
}

export function ReviewsSummary() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch("/api/reviews");
        const data = await response.json();
        setReviews(data.reviews.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-[#f1f5f9]">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-[#94a3b8]">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#f1f5f9]">Recent Reviews</CardTitle>
        <Link
          href="/dashboard/reviews"
          className="text-sm text-[#6366f1] hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-sm text-[#94a3b8] text-center py-4">
            No recent reviews
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-3 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating
                            ? "fill-[#f59e0b] text-[#f59e0b]"
                            : "text-[#94a3b8]"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#94a3b8]">
                    {review.reviewerNickname}
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] line-clamp-2">
                  {review.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
