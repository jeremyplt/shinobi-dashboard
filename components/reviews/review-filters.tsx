"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Apple, Smartphone, Star } from "lucide-react";

interface ReviewFiltersProps {
  platform: string;
  rating: string;
  onPlatformChange: (value: string) => void;
  onRatingChange: (value: string) => void;
}

export function ReviewFilters({
  platform,
  rating,
  onPlatformChange,
  onRatingChange,
}: ReviewFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Platform Filter */}
      <div className="flex items-center gap-2">
        <Button
          variant={platform === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onPlatformChange("all")}
          className={
            platform === "all"
              ? "bg-[#6366f1] hover:bg-[#6366f1]/80"
              : "border-[#1e1e2e] text-[#94a3b8] hover:bg-[#1e1e2e]"
          }
        >
          All
        </Button>
        <Button
          variant={platform === "ios" ? "default" : "outline"}
          size="sm"
          onClick={() => onPlatformChange("ios")}
          className={
            platform === "ios"
              ? "bg-blue-600 hover:bg-blue-600/80"
              : "border-[#1e1e2e] text-[#94a3b8] hover:bg-[#1e1e2e]"
          }
        >
          <Apple className="w-3.5 h-3.5 mr-1" />
          iOS
        </Button>
        <Button
          variant={platform === "android" ? "default" : "outline"}
          size="sm"
          onClick={() => onPlatformChange("android")}
          className={
            platform === "android"
              ? "bg-green-600 hover:bg-green-600/80"
              : "border-[#1e1e2e] text-[#94a3b8] hover:bg-[#1e1e2e]"
          }
        >
          <Smartphone className="w-3.5 h-3.5 mr-1" />
          Android
        </Button>
      </div>

      {/* Rating Filter */}
      <Select value={rating} onValueChange={onRatingChange}>
        <SelectTrigger className="w-[140px] bg-[#111118] border-[#1e1e2e] text-[#f1f5f9]">
          <SelectValue placeholder="All Ratings" />
        </SelectTrigger>
        <SelectContent className="bg-[#111118] border-[#1e1e2e]">
          <SelectItem value="all" className="text-[#f1f5f9]">
            All Ratings
          </SelectItem>
          {[5, 4, 3, 2, 1].map((star) => (
            <SelectItem key={star} value={String(star)} className="text-[#f1f5f9]">
              <span className="flex items-center gap-1">
                {star} <Star className="w-3 h-3 text-[#f59e0b]" fill="currentColor" strokeWidth={0} />
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
