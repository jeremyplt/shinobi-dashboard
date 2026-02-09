"use client";

import { useEffect, useState } from "react";
import { ErrorList } from "@/components/errors/error-list";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface SentryIssue {
  id: string;
  title: string;
  count: number;
  userCount: number;
  lastSeen: string;
  firstSeen: string;
  level: string;
  culprit: string;
}

export default function ErrorsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [issues, setIssues] = useState<SentryIssue[]>([]);

  useEffect(() => {
    async function fetchErrors() {
      try {
        const response = await fetch("/api/sentry");
        const data = await response.json();
        
        setIssues(data.issues);
        setError(!!data.error);
      } catch (err) {
        console.error("Failed to fetch errors:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchErrors();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Errors</h1>
        <Skeleton className="h-[400px] bg-[#111118]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f1f5f9]">Errors</h1>

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

      <ErrorList issues={issues} />
    </div>
  );
}
