"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const shortcuts: Record<string, string> = {
  "1": "/dashboard",
  "2": "/dashboard/analytics",
  "3": "/dashboard/reviews",
  "4": "/dashboard/revenue",
  "5": "/dashboard/errors",
  "6": "/dashboard/support",
  "7": "/dashboard/settings",
};

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only trigger with Alt key held
      if (!e.altKey) return;
      
      // Don't trigger when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const path = shortcuts[e.key];
      if (path) {
        e.preventDefault();
        router.push(path);
      }

      // Alt+R = refresh
      if (e.key === "r") {
        e.preventDefault();
        window.location.reload();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
