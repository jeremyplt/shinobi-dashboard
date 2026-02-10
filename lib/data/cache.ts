/**
 * Simple in-memory server-side cache with TTL
 * Used to avoid hammering APIs on every page load
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Get or fetch data with caching
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const existing = cache.get(key);
  if (existing && existing.expiresAt > Date.now()) {
    return existing.data as T;
  }

  const data = await fetcher();
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  return data;
}

/**
 * Invalidate a specific cache key
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * Invalidate all cache entries matching a prefix
 */
export function invalidateCachePrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}
