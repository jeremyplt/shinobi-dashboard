"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseAutoRefreshOptions {
  intervalMs?: number; // default 5 minutes
  enabled?: boolean;
  onRefresh: () => void | Promise<void>;
}

export function useAutoRefresh({
  intervalMs = 5 * 60 * 1000,
  enabled = true,
  onRefresh,
}: UseAutoRefreshOptions) {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefreshed(new Date());
    } catch (e) {
      console.error("Auto-refresh failed:", e);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      refresh();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, intervalMs, refresh]);

  return { lastRefreshed, isRefreshing, refresh };
}
