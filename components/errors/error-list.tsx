"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

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

interface ErrorListProps {
  issues: SentryIssue[];
}

export function ErrorList({ issues }: ErrorListProps) {
  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-[#ef4444]" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />;
      default:
        return <Info className="w-4 h-4 text-[#6366f1]" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/50";
      case "warning":
        return "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/50";
      default:
        return "bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/50";
    }
  };

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader>
        <CardTitle className="text-[#f1f5f9]">Unresolved Issues</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {issues.length === 0 ? (
            <p className="text-sm text-[#94a3b8] text-center py-8">
              No errors to display 🎉
            </p>
          ) : (
            issues.map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] hover:border-[#6366f1]/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {getLevelIcon(issue.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-[#f1f5f9] truncate">
                        {issue.title}
                      </h3>
                      <Badge className={getLevelColor(issue.level)}>
                        {issue.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#94a3b8] mb-2">
                      {issue.culprit}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#94a3b8]">
                      <span>
                        <strong className="text-[#f1f5f9]">{issue.count}</strong>{" "}
                        events
                      </span>
                      <span>
                        <strong className="text-[#f1f5f9]">
                          {issue.userCount}
                        </strong>{" "}
                        users
                      </span>
                      <span>Last seen: {formatDate(issue.lastSeen)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
