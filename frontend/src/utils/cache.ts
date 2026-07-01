// Frontend caching utility for API responses
const CACHE_PREFIX = "vogue_cache_";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: any;
  timestamp: number;
}

export const cacheManager = {
  // Get from cache
  get: (key: string) => {
    try {
      const cached = localStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;

      const entry: CacheEntry = JSON.parse(cached);
      const isExpired = Date.now() - entry.timestamp > CACHE_TTL;

      if (isExpired) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }

      return entry.data;
    } catch (e) {
      console.error("Cache get error:", e);
      return null;
    }
  },

  // Set in cache
  set: (key: string, data: any) => {
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (e) {
      console.error("Cache set error:", e);
    }
  },

  // Clear cache
  clear: (key?: string) => {
    try {
      if (key) {
        localStorage.removeItem(CACHE_PREFIX + key);
      } else {
        // Clear all vogue cache
        Object.keys(localStorage)
          .filter((k) => k.startsWith(CACHE_PREFIX))
          .forEach((k) => localStorage.removeItem(k));
      }
    } catch (e) {
      console.error("Cache clear error:", e);
    }
  },
};
