"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  XCircle,
  MinusCircle,
  RefreshCw,
  Activity,
  Clock,
  Loader2,
  Server,
} from "lucide-react";

interface ServiceHealth {
  name: string;
  status: "connected" | "error" | "not_configured";
  latencyMs?: number;
  error?: string;
  details?: string;
}

interface HealthData {
  overall: "healthy" | "degraded";
  configured: number;
  total: number;
  services: ServiceHealth[];
  timestamp: string;
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "connected":
      return <CheckCircle className="w-5 h-5 text-[#22c55e]" />;
    case "error":
      return <XCircle className="w-5 h-5 text-[#ef4444]" />;
    case "not_configured":
      return <MinusCircle className="w-5 h-5 text-[#64748b]" />;
    default:
      return <MinusCircle className="w-5 h-5 text-[#64748b]" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    connected: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30",
    error: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30",
    not_configured: "bg-[#64748b]/10 text-[#64748b] border-[#64748b]/30",
  };

  const labels = {
    connected: "Connected",
    error: "Error",
    not_configured: "Not Configured",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
        styles[status as keyof typeof styles] || styles.not_configured
      }`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchHealth() {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      console.error("Failed to fetch health:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchHealth();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    fetchHealth();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Settings</h1>
        <Skeleton className="h-[100px] bg-[#111118]" />
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-[80px] bg-[#111118]" />
          ))}
        </div>
      </div>
    );
  }

  const connectedCount = health?.services.filter(s => s.status === "connected").length || 0;
  const errorCount = health?.services.filter(s => s.status === "error").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Settings</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-[#94a3b8] hover:text-[#f1f5f9]"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-1" />
          )}
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card className={`border ${health?.overall === "healthy" ? "bg-[#22c55e]/5 border-[#22c55e]/20" : "bg-[#f59e0b]/5 border-[#f59e0b]/20"}`}>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${health?.overall === "healthy" ? "bg-[#22c55e]/10" : "bg-[#f59e0b]/10"}`}>
              <Activity className={`w-6 h-6 ${health?.overall === "healthy" ? "text-[#22c55e]" : "text-[#f59e0b]"}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f1f5f9]">
                System {health?.overall === "healthy" ? "Healthy" : "Degraded"}
              </h2>
              <p className="text-sm text-[#94a3b8]">
                {connectedCount} of {health?.total} services connected
                {errorCount > 0 && ` · ${errorCount} with errors`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#64748b] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-[#f1f5f9] flex items-center gap-2">
            <Server className="w-5 h-5 text-[#6366f1]" />
            Connected Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {health?.services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e]"
            >
              <div className="flex items-center gap-3">
                <StatusIcon status={service.status} />
                <div>
                  <h3 className="text-sm font-medium text-[#f1f5f9]">
                    {service.name}
                  </h3>
                  <p className="text-xs text-[#64748b]">
                    {service.details || service.error || "Not configured"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {service.latencyMs !== undefined && (
                  <span className={`text-xs ${
                    service.latencyMs < 500 ? "text-[#22c55e]" : 
                    service.latencyMs < 2000 ? "text-[#f59e0b]" : "text-[#ef4444]"
                  }`}>
                    {service.latencyMs}ms
                  </span>
                )}
                <StatusBadge status={service.status} />
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-[#f1f5f9] text-base">Environment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#94a3b8]">Platform</span>
            <span className="text-[#f1f5f9] font-mono text-xs">Vercel</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#94a3b8]">Framework</span>
            <span className="text-[#f1f5f9] font-mono text-xs">Next.js 16</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#94a3b8]">Database</span>
            <span className="text-[#f1f5f9] font-mono text-xs">Neon PostgreSQL</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#94a3b8]">Region</span>
            <span className="text-[#f1f5f9] font-mono text-xs">Frankfurt (FRA1)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
