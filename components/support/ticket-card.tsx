"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Bug,
  Mail,
  Apple,
  Smartphone,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SupportTicket } from "@/lib/data/support";

const priorityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const sourceIcons: Record<string, typeof Star> = {
  review: MessageSquare,
  sentry: Bug,
  email: Mail,
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-3.5 h-3.5",
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-[#2e2e3e]"
          )}
        />
      ))}
    </div>
  );
}

function TimeAgo({ date }: { date: string }) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  let text: string;
  if (diffDays > 30) text = `${Math.floor(diffDays / 30)}mo ago`;
  else if (diffDays > 0) text = `${diffDays}d ago`;
  else if (diffHours > 0) text = `${diffHours}h ago`;
  else text = "Just now";

  return (
    <span className="flex items-center gap-1 text-xs text-[#64748b]">
      <Clock className="w-3 h-3" />
      {text}
    </span>
  );
}

export function TicketCard({ ticket }: { ticket: SupportTicket }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const SourceIcon = sourceIcons[ticket.source] || MessageSquare;

  const copyBody = async () => {
    await navigator.clipboard.writeText(ticket.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "bg-[#111118] border-[#1e1e2e] hover:border-[#2e2e3e] transition-colors cursor-pointer",
          ticket.priority === "critical" && "border-l-2 border-l-red-500"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="mt-0.5">
                <SourceIcon className="w-4 h-4 text-[#6366f1]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-sm font-medium text-[#f1f5f9] truncate max-w-[300px]">
                    {ticket.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] px-1.5 py-0", priorityColors[ticket.priority])}
                  >
                    {ticket.priority}
                  </Badge>
                  {ticket.status === "replied" && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 bg-green-500/20 text-green-400 border-green-500/30"
                    >
                      Replied
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
                  <span>{ticket.author}</span>
                  {ticket.platform && (
                    <span className="flex items-center gap-1">
                      {ticket.platform === "ios" ? (
                        <Apple className="w-3 h-3" />
                      ) : (
                        <Smartphone className="w-3 h-3" />
                      )}
                      {ticket.platform === "ios" ? "iOS" : "Android"}
                    </span>
                  )}
                  {ticket.rating !== undefined && <StarRating rating={ticket.rating} />}
                  <TimeAgo date={ticket.createdAt} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {ticket.sentryLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-[#64748b] hover:text-[#f1f5f9]"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(ticket.sentryLink, "_blank");
                  }}
                  title="Open in Sentry"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-[#64748b]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#64748b]" />
              )}
            </div>
          </div>

          {/* Preview (when collapsed) */}
          {!expanded && (
            <p className="text-xs text-[#64748b] mt-2 line-clamp-2 ml-7">
              {ticket.body}
            </p>
          )}

          {/* Expanded content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-4 ml-7 space-y-3">
                  {/* Full body */}
                  <div className="relative">
                    <div className="p-3 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e]">
                      <p className="text-sm text-[#94a3b8] whitespace-pre-wrap">
                        {ticket.body}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 text-[#64748b] hover:text-[#f1f5f9]"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyBody();
                      }}
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>

                  {/* Reply (if exists) */}
                  {ticket.replyText && (
                    <div className="p-3 rounded-lg bg-[#6366f1]/5 border border-[#6366f1]/20">
                      <p className="text-[10px] text-[#6366f1] uppercase tracking-wider font-medium mb-1">
                        Developer Response
                      </p>
                      <p className="text-sm text-[#94a3b8]">{ticket.replyText}</p>
                    </div>
                  )}

                  {/* Metadata */}
                  {ticket.metadata && Object.keys(ticket.metadata).length > 0 && (
                    <div className="flex gap-3 flex-wrap">
                      {Object.entries(ticket.metadata).map(([key, val]) => (
                        <span
                          key={key}
                          className="text-[10px] text-[#64748b] bg-[#1e1e2e] px-2 py-0.5 rounded"
                        >
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
