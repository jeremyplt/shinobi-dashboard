"use client";

import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/layout/command-palette";
import { DateRangePicker } from "@/components/layout/date-range-picker";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/analytics": "Analytics",
  "/dashboard/reviews": "Reviews",
  "/dashboard/revenue": "Revenue",
  "/dashboard/errors": "Errors",
  "/dashboard/support": "Support",
  "/dashboard/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";

  return (
    <header className="h-16 border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-sm px-4 md:px-6 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-lg md:text-xl font-semibold text-[#f1f5f9]">{title}</h1>

      <div className="flex items-center gap-2 md:gap-3">
        <CommandPalette />
        <DateRangePicker />
        <Button
          variant="ghost"
          size="sm"
          className="text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e1e2e] h-8 w-8 p-0"
          onClick={() => window.location.reload()}
          title="Refresh data (Alt+R)"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
