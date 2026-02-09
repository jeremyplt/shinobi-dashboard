"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ReviewCard } from "@/components/reviews/review-card";
import { RatingStats } from "@/components/reviews/rating-stats";
import { ReviewFilters } from "@/components/reviews/review-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  reviewerNickname: string;
  createdDate: string;
  platform: "ios" | "android";
  version: string;
}

interface ReviewStats {
  total: number;
  avgRating: number;
  ratingDistribution: number[];
}

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    avgRating: 0,
    ratingDistribution: [0, 0, 0, 0, 0],
  });
  const [platformFilter, setPlatformFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch("/api/reviews");
        const data = await response.json();

        setReviews(data.reviews);
        setStats(data.stats);
        setError(!!data.error);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter((review) => {
    if (platformFilter !== "all" && review.platform !== platformFilter) {
      return false;
    }
    if (ratingFilter !== "all" && review.rating !== Number(ratingFilter)) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Reviews</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-[200px] bg-[#111118]" />
          <div className="md:col-span-2 space-y-3">
            <Skeleton className="h-[90px] bg-[#111118]" />
            <Skeleton className="h-[90px] bg-[#111118]" />
            <Skeleton className="h-[90px] bg-[#111118]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Reviews</h1>
        <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
          <MessageSquare className="w-4 h-4" />
          {filteredReviews.length} reviews
        </div>
      </div>

      {error && (
        <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-sm text-[#f59e0b]">
              API connection error — showing cached data
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar Stats */}
        <div className="space-y-4">
          <RatingStats
            avgRating={stats.avgRating}
            total={stats.total}
            distribution={stats.ratingDistribution}
          />
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          <ReviewFilters
            platform={platformFilter}
            rating={ratingFilter}
            onPlatformChange={setPlatformFilter}
            onRatingChange={setRatingFilter}
          />

          {filteredReviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="bg-[#111118] border-[#1e1e2e]">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="w-12 h-12 text-[#94a3b8] mb-3" />
                  <p className="text-[#94a3b8] text-sm">
                    No reviews match your filters
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((review, index) => (
                <ReviewCard key={review.id} review={review} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
