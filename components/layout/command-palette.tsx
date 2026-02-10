"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  DollarSign,
  AlertCircle,
  Settings,
  Search,
  RefreshCw,
  ExternalLink,
  Headphones,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const pages = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, keywords: ["home", "overview"] },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, keywords: ["dau", "mau", "retention", "users", "posthog"] },
  { name: "Reviews", href: "/dashboard/reviews", icon: MessageSquare, keywords: ["app store", "google play", "ratings", "feedback"] },
  { name: "Revenue", href: "/dashboard/revenue", icon: DollarSign, keywords: ["mrr", "arr", "subscriptions", "revenuecat", "money"] },
  { name: "Errors", href: "/dashboard/errors", icon: AlertCircle, keywords: ["sentry", "crashes", "bugs", "issues"] },
  { name: "Support", href: "/dashboard/support", icon: Headphones, keywords: ["feedback", "tickets", "help", "users"] },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, keywords: ["api", "health", "config"] },
];

const quickActions = [
  { name: "Refresh data", action: "refresh", icon: RefreshCw, keywords: ["reload"] },
  { name: "Open Sentry", action: "sentry", icon: ExternalLink, keywords: ["errors", "crashes"] },
  { name: "Open RevenueCat", action: "revenuecat", icon: TrendingUp, keywords: ["revenue", "subscriptions"] },
  { name: "Open App Store Connect", action: "appstore", icon: Star, keywords: ["ios", "apple"] },
  { name: "Open Google Play Console", action: "playstore", icon: Star, keywords: ["android"] },
  { name: "Open PostHog", action: "posthog", icon: Zap, keywords: ["analytics", "events"] },
];

const externalLinks: Record<string, string> = {
  sentry: "https://shinobi-japanese.sentry.io/issues/",
  revenuecat: "https://app.revenuecat.com/overview",
  appstore: "https://appstoreconnect.apple.com/",
  playstore: "https://play.google.com/console/",
  posthog: "https://us.posthog.com/",
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (value: string) => {
      setOpen(false);

      // Check if it's a page
      const page = pages.find((p) => p.href === value);
      if (page) {
        router.push(page.href);
        return;
      }

      // Check if it's a quick action
      if (value === "refresh") {
        window.location.reload();
        return;
      }

      // Check if it's an external link
      const url = externalLinks[value];
      if (url) {
        window.open(url, "_blank");
        return;
      }
    },
    [router]
  );

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111118] border border-[#1e1e2e] text-sm text-[#64748b] hover:text-[#94a3b8] hover:border-[#2e2e3e] transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search...</span>
        <kbd className="ml-4 text-[10px] bg-[#1e1e2e] px-1.5 py-0.5 rounded font-mono">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="bg-[#111118] border-[#1e1e2e]">
          <CommandInput
            placeholder="Search pages, actions..."
            className="text-[#f1f5f9] placeholder:text-[#64748b]"
          />
          <CommandList className="text-[#f1f5f9]">
            <CommandEmpty className="text-[#64748b]">
              No results found.
            </CommandEmpty>

            <CommandGroup heading="Pages" className="text-[#64748b]">
              {pages.map((page) => (
                <CommandItem
                  key={page.href}
                  value={page.href}
                  keywords={page.keywords}
                  onSelect={handleSelect}
                  className="text-[#94a3b8] hover:text-[#f1f5f9] data-[selected=true]:bg-[#1e1e2e] data-[selected=true]:text-[#f1f5f9]"
                >
                  <page.icon className="mr-2 h-4 w-4 text-[#6366f1]" />
                  <span>{page.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator className="bg-[#1e1e2e]" />

            <CommandGroup heading="Quick Actions" className="text-[#64748b]">
              {quickActions.map((action) => (
                <CommandItem
                  key={action.action}
                  value={action.action}
                  keywords={action.keywords}
                  onSelect={handleSelect}
                  className="text-[#94a3b8] hover:text-[#f1f5f9] data-[selected=true]:bg-[#1e1e2e] data-[selected=true]:text-[#f1f5f9]"
                >
                  <action.icon className="mr-2 h-4 w-4 text-[#f59e0b]" />
                  <span>{action.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
