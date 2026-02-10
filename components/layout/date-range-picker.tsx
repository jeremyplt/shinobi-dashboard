"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDateRange } from "@/lib/date-range-context";
import { cn } from "@/lib/utils";

export function DateRangePicker() {
  const { range, setRange, presets } = useDateRange();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111118] border border-[#1e1e2e] text-sm hover:bg-[#1e1e2e] transition-colors h-auto",
            "text-[#94a3b8] hover:text-[#f1f5f9]"
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5 text-[#6366f1]" />
          <span className="hidden lg:inline">{range.label}</span>
          <span className="lg:hidden text-xs">
            {format(range.from, "MMM d")} - {format(range.to, "MMM d")}
          </span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-[#111118] border-[#1e1e2e] shadow-xl shadow-black/50"
        align="end"
        sideOffset={8}
      >
        <div className="flex">
          {/* Presets */}
          <div className="border-r border-[#1e1e2e] p-2 space-y-0.5 min-w-[160px]">
            <p className="text-[10px] font-medium text-[#64748b] uppercase tracking-wider px-2 py-1">
              Presets
            </p>
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setRange(preset);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors",
                  range.label === preset.label
                    ? "bg-[#6366f1]/20 text-[#6366f1]"
                    : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e1e2e]"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={{ from: range.from, to: range.to }}
              onSelect={(selected) => {
                if (selected?.from && selected?.to) {
                  setRange({
                    from: selected.from,
                    to: selected.to,
                    label: `${format(selected.from, "MMM d")} - ${format(selected.to, "MMM d, yyyy")}`,
                  });
                  setOpen(false);
                } else if (selected?.from) {
                  setRange({
                    from: selected.from,
                    to: selected.from,
                    label: format(selected.from, "MMM d, yyyy"),
                  });
                }
              }}
              numberOfMonths={2}
              className="text-[#f1f5f9]"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
