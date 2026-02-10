"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, ExternalLink, Bug } from "lucide-react";

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

const SENTRY_ORG = "shinobi-japanese";
const SENTRY_PROJECT = "shinobi-japanese-react-native";

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

  const getImpactColor = (userCount: number) => {
    if (userCount >= 1000) return "text-[#ef4444]";
    if (userCount >= 100) return "text-[#f59e0b]";
    return "text-[#94a3b8]";
  };

  return (
    <Card className="bg-[#111118] border-[#1e1e2e]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#f1f5f9] flex items-center gap-2">
          <Bug className="w-5 h-5 text-[#ef4444]" />
          Unresolved Issues ({issues.length})
        </CardTitle>
        <a
          href={`https://${SENTRY_ORG}.sentry.io/issues/?project=&query=is%3Aunresolved`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#6366f1] hover:text-[#818cf8] flex items-center gap-1 transition-colors"
        >
          Open in Sentry
          <ExternalLink className="w-3 h-3" />
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-sm text-[#94a3b8]">No unresolved errors!</p>
            </div>
          ) : (
            issues.map((issue, index) => (
              <motion.a
                key={issue.id}
                href={`https://${SENTRY_ORG}.sentry.io/issues/${issue.id}/`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="block p-4 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] hover:border-[#6366f1]/50 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {getLevelIcon(issue.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-[#f1f5f9] truncate group-hover:text-[#6366f1] transition-colors">
                        {issue.title}
                      </h3>
                      <Badge className={getLevelColor(issue.level)}>
                        {issue.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#64748b] mb-2 truncate font-mono">
                      {issue.culprit}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-[#94a3b8]">
                        <strong className="text-[#f1f5f9]">{formatNumber(issue.count)}</strong>{" "}
                        events
                      </span>
                      <span className={getImpactColor(issue.userCount)}>
                        <strong>{formatNumber(issue.userCount)}</strong>{" "}
                        users affected
                      </span>
                      <span className="text-[#64748b]">
                        Last: {formatDate(issue.lastSeen)}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#64748b] group-hover:text-[#6366f1] transition-colors shrink-0 mt-1" />
                </div>
              </motion.a>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
