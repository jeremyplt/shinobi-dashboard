"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  DollarSign,
  AlertCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Reviews", href: "/dashboard/reviews", icon: MessageSquare },
  { name: "Revenue", href: "/dashboard/revenue", icon: DollarSign },
  { name: "Errors", href: "/dashboard/errors", icon: AlertCircle },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <>
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
              onClick={() => setMobileOpen(false)}
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

      {/* Collapse Toggle (Desktop only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex h-12 items-center justify-center border-t border-[#1e1e2e] text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: collapsed ? 64 : 240 }}
        className="hidden md:flex fixed left-0 top-0 h-full bg-[#111118] border-r border-[#1e1e2e] flex-col z-50"
      >
        <SidebarContent />
      </motion.div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#111118] border border-[#1e1e2e] text-[#f1f5f9]"
      >
        {mobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <LayoutDashboard className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", damping: 20 }}
              className="md:hidden fixed left-0 top-0 h-full w-64 bg-[#111118] border-r border-[#1e1e2e] flex flex-col z-50"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
