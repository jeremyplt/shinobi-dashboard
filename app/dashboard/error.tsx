"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="bg-[#111118] border-[#1e1e2e] max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <div className="p-3 rounded-full bg-[#ef4444]/10 w-fit mx-auto">
            <AlertCircle className="w-8 h-8 text-[#ef4444]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#f1f5f9] mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-[#94a3b8]">
              {error.message || "An unexpected error occurred while loading the dashboard."}
            </p>
            {error.digest && (
              <p className="text-xs text-[#64748b] mt-2 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <Button
            onClick={reset}
            className="bg-[#6366f1] hover:bg-[#5558e6] text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
