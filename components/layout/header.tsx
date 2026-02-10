"use client";

import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/analytics": "Analytics",
  "/dashboard/reviews": "Reviews",
  "/dashboard/revenue": "Revenue",
  "/dashboard/errors": "Errors",
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";

  return (
    <header className="h-16 border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-[#f1f5f9]">{title}</h1>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e1e2e]"
          onClick={() => window.location.reload()}
          title="Refresh data"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111118] border border-[#1e1e2e] text-sm text-[#94a3b8]">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span>Live</span>
          <span className="text-[#64748b]">·</span>
          <span>
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </header>
  );
}
