"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Headphones, Inbox } from "lucide-react";
import { TicketCard } from "@/components/support/ticket-card";
import { TicketFilters } from "@/components/support/ticket-filters";
import {
  SupportStatsCards,
  SourceBreakdown,
  PriorityBreakdown,
} from "@/components/support/support-stats";
import type {
  SupportTicket,
  SupportStats,
  TicketSource,
  TicketPriority,
  TicketStatus,
} from "@/lib/data/support";

interface FilterState {
  search: string;
  source: TicketSource | "all";
  priority: TicketPriority | "all";
  status: TicketStatus | "all";
  sortBy: "date" | "priority" | "rating";
}

function SupportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[90px] bg-[#111118]" />
        ))}
      </div>
      <Skeleton className="h-[40px] bg-[#111118]" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-[80px] bg-[#111118]" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="p-4 rounded-full bg-[#6366f1]/10 mb-4">
          <Inbox className="w-8 h-8 text-[#6366f1]" />
        </div>
        <h3 className="text-lg font-medium text-[#f1f5f9] mb-1">
          No tickets found
        </h3>
        <p className="text-sm text-[#64748b] text-center max-w-sm">
          No support tickets match your current filters. Try adjusting your
          search or filter criteria.
        </p>
      </CardContent>
    </Card>
  );
}

export default function SupportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    source: "all",
    priority: "all",
    status: "all",
    sortBy: "priority",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/support");
        const data = await res.json();
        if (data.error && data.tickets.length === 0) {
          setError(data.error);
        } else {
          setTickets(data.tickets);
          setStats(data.stats);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load support data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.body.toLowerCase().includes(q) ||
          t.author.toLowerCase().includes(q)
      );
    }

    // Source filter
    if (filters.source !== "all") {
      result = result.filter((t) => t.source === filters.source);
    }

    // Priority filter
    if (filters.priority !== "all") {
      result = result.filter((t) => t.priority === filters.priority);
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((t) => t.status === filters.status);
    }

    // Sort
    const priorityOrder: Record<TicketPriority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    if (filters.sortBy === "date") {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (filters.sortBy === "priority") {
      result.sort((a, b) => {
        const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (pDiff !== 0) return pDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else if (filters.sortBy === "rating") {
      result.sort((a, b) => (a.rating || 5) - (b.rating || 5));
    }

    return result;
  }, [tickets, filters]);

  if (loading) return <SupportSkeleton />;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Headphones className="w-6 h-6 text-[#6366f1]" />
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Support</h1>
          <p className="text-xs text-[#64748b]">
            Aggregated tickets from reviews, errors, and user feedback
          </p>
        </div>
      </div>

      {error && (
        <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="w-4 h-4 text-[#f59e0b] shrink-0" />
            <span className="text-sm text-[#f59e0b]">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {stats && <SupportStatsCards stats={stats} />}

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Ticket list */}
        <div className="lg:col-span-3 space-y-4">
          <TicketFilters
            filters={filters}
            onChange={setFilters}
            resultCount={filteredTickets.length}
          />

          {filteredTickets.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {filteredTickets.map((ticket, i) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {stats && (
            <>
              <SourceBreakdown stats={stats} />
              <PriorityBreakdown stats={stats} />
            </>
          )}

          {/* Future: Brevo integration notice */}
          <Card className="bg-[#111118] border-[#1e1e2e] border-dashed">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-[#64748b] mb-2">📧 Email Integration</p>
              <p className="text-[10px] text-[#4a4a5a]">
                Connect Brevo to centralize user emails and support conversations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
