"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface TopEvent {
  event: string;
  count: number;
  uniqueUsers: number;
}

interface TopEventsTableProps {
  events: TopEvent[];
}

export function TopEventsTable({ events }: TopEventsTableProps) {
  const maxCount = events.length > 0 ? events[0].count : 1;

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#f1f5f9] text-base flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#f59e0b]" />
          Top Events (7d)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-[#94a3b8]">
            No events tracked
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <motion.div
                key={event.event}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                {/* Background bar */}
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(event.count / maxCount) * 100}%` }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                    className="h-full bg-[#6366f1]/10"
                  />
                </div>

                {/* Content */}
                <div className="relative flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-[#64748b] w-5 text-right shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm text-[#f1f5f9] truncate font-mono">
                      {event.event}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-[#94a3b8]">
                      {formatNumber(event.uniqueUsers)} users
                    </span>
                    <span className="text-sm font-medium text-[#6366f1]">
                      {formatNumber(event.count)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
