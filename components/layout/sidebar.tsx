"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  DollarSign,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Reviews", href: "/dashboard/reviews", icon: MessageSquare },
  { name: "Revenue", href: "/dashboard/revenue", icon: DollarSign },
  { name: "Errors", href: "/dashboard/errors", icon: AlertCircle },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      className="fixed left-0 top-0 h-full bg-[#111118] border-r border-[#1e1e2e] flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-[#1e1e2e]">
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1 }}
          className="text-2xl font-bold"
        >
          {collapsed ? "🥷" : "🥷 Shinobi"}
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#6366f1]/10 text-[#6366f1]"
                  : "text-[#94a3b8] hover:bg-[#1e1e2e] hover:text-[#f1f5f9]"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <motion.span
                initial={false}
                animate={{
                  opacity: collapsed ? 0 : 1,
                  width: collapsed ? 0 : "auto",
                }}
                className="overflow-hidden whitespace-nowrap"
              >
                {item.name}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-12 flex items-center justify-center border-t border-[#1e1e2e] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </motion.div>
  );
}
