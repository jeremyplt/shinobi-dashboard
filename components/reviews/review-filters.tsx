"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Apple, Smartphone, Star, Search, ArrowUpDown } from "lucide-react";

interface ReviewFiltersProps {
  platform: string;
  rating: string;
  search?: string;
  sort?: string;
  onPlatformChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onSearchChange?: (value: string) => void;
  onSortChange?: (value: string) => void;
}

export function ReviewFilters({
  platform,
  rating,
  search = "",
  sort = "newest",
  onPlatformChange,
  onRatingChange,
  onSearchChange,
  onSortChange,
}: ReviewFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Search + Sort Row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <Input
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search reviews..."
            className="pl-9 bg-[#111118] border-[#1e1e2e] text-[#f1f5f9] placeholder:text-[#64748b]"
          />
        </div>
        <Select value={sort} onValueChange={(v) => onSortChange?.(v)}>
          <SelectTrigger className="w-[150px] bg-[#111118] border-[#1e1e2e] text-[#f1f5f9]">
            <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-[#94a3b8]" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#111118] border-[#1e1e2e]">
            <SelectItem value="newest" className="text-[#f1f5f9]">Newest First</SelectItem>
            <SelectItem value="oldest" className="text-[#f1f5f9]">Oldest First</SelectItem>
            <SelectItem value="rating-high" className="text-[#f1f5f9]">Rating High→Low</SelectItem>
            <SelectItem value="rating-low" className="text-[#f1f5f9]">Rating Low→High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Platform + Rating Filters */}
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
    </div>
  );
}
