"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { TicketSource, TicketPriority, TicketStatus } from "@/lib/data/support";

interface FilterState {
  search: string;
  source: TicketSource | "all";
  priority: TicketPriority | "all";
  status: TicketStatus | "all";
  sortBy: "date" | "priority" | "rating";
}

interface TicketFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCount: number;
}

export function TicketFilters({ filters, onChange, resultCount }: TicketFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
        <Input
          placeholder="Search tickets..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-10 bg-[#111118] border-[#1e1e2e] text-[#f1f5f9] placeholder:text-[#64748b] focus:border-[#6366f1] h-9"
        />
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748b]" />

        <Select
          value={filters.source}
          onValueChange={(v) => onChange({ ...filters, source: v as FilterState["source"] })}
        >
          <SelectTrigger className="w-[130px] h-8 bg-[#111118] border-[#1e1e2e] text-[#94a3b8] text-xs">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent className="bg-[#111118] border-[#1e1e2e]">
            <SelectItem value="all" className="text-[#94a3b8] text-xs">All Sources</SelectItem>
            <SelectItem value="review" className="text-[#94a3b8] text-xs">Reviews</SelectItem>
            <SelectItem value="sentry" className="text-[#94a3b8] text-xs">Sentry</SelectItem>
            <SelectItem value="email" className="text-[#94a3b8] text-xs">Email</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(v) => onChange({ ...filters, priority: v as FilterState["priority"] })}
        >
          <SelectTrigger className="w-[130px] h-8 bg-[#111118] border-[#1e1e2e] text-[#94a3b8] text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="bg-[#111118] border-[#1e1e2e]">
            <SelectItem value="all" className="text-[#94a3b8] text-xs">All Priorities</SelectItem>
            <SelectItem value="critical" className="text-[#94a3b8] text-xs">🔴 Critical</SelectItem>
            <SelectItem value="high" className="text-[#94a3b8] text-xs">🟠 High</SelectItem>
            <SelectItem value="medium" className="text-[#94a3b8] text-xs">🟡 Medium</SelectItem>
            <SelectItem value="low" className="text-[#94a3b8] text-xs">⚪ Low</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(v) => onChange({ ...filters, status: v as FilterState["status"] })}
        >
          <SelectTrigger className="w-[130px] h-8 bg-[#111118] border-[#1e1e2e] text-[#94a3b8] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#111118] border-[#1e1e2e]">
            <SelectItem value="all" className="text-[#94a3b8] text-xs">All Status</SelectItem>
            <SelectItem value="open" className="text-[#94a3b8] text-xs">Open</SelectItem>
            <SelectItem value="replied" className="text-[#94a3b8] text-xs">Replied</SelectItem>
            <SelectItem value="resolved" className="text-[#94a3b8] text-xs">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy}
          onValueChange={(v) => onChange({ ...filters, sortBy: v as FilterState["sortBy"] })}
        >
          <SelectTrigger className="w-[130px] h-8 bg-[#111118] border-[#1e1e2e] text-[#94a3b8] text-xs">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent className="bg-[#111118] border-[#1e1e2e]">
            <SelectItem value="date" className="text-[#94a3b8] text-xs">Newest First</SelectItem>
            <SelectItem value="priority" className="text-[#94a3b8] text-xs">By Priority</SelectItem>
            <SelectItem value="rating" className="text-[#94a3b8] text-xs">By Rating</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-[#64748b] ml-auto">
          {resultCount} ticket{resultCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
