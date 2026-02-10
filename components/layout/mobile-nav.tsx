"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  DollarSign,
  AlertCircle,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Reviews", href: "/dashboard/reviews", icon: MessageSquare },
  { name: "Revenue", href: "/dashboard/revenue", icon: DollarSign },
  { name: "Errors", href: "/dashboard/errors", icon: AlertCircle },
  { name: "Support", href: "/dashboard/support", icon: Headphones },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111118] border-t border-[#1e1e2e] safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[48px]",
                isActive
                  ? "text-[#6366f1]"
                  : "text-[#64748b] active:text-[#94a3b8]"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
