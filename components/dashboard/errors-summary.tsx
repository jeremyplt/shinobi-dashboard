"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SentryIssue {
  id: string;
  title: string;
  count: number;
  level: string;
}

export function ErrorsSummary() {
  const [errors, setErrors] = useState<SentryIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchErrors() {
      try {
        const response = await fetch("/api/sentry");
        const data = await response.json();
        setErrors(data.issues.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch errors:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchErrors();
  }, []);

  const getLevelIcon = (level: string) => {
    return level === "error" ? (
      <AlertCircle className="w-3 h-3 text-[#ef4444]" />
    ) : (
      <AlertTriangle className="w-3 h-3 text-[#f59e0b]" />
    );
  };

  const getLevelColor = (level: string) => {
    return level === "error"
      ? "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/50"
      : "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/50";
  };

  if (loading) {
    return (
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-[#f1f5f9]">Top Errors</CardTitle>
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
        <CardTitle className="text-[#f1f5f9]">Top Errors</CardTitle>
        <Link
          href="/dashboard/errors"
          className="text-sm text-[#6366f1] hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {errors.length === 0 ? (
          <div className="text-sm text-[#94a3b8] text-center py-4">
            No errors 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {errors.map((error) => (
              <div
                key={error.id}
                className="p-3 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e]"
              >
                <div className="flex items-start gap-2">
                  {getLevelIcon(error.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs font-medium text-[#f1f5f9] truncate">
                        {error.title}
                      </h4>
                      <Badge className={getLevelColor(error.level)}>
                        {error.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#94a3b8]">
                      {error.count} events
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
