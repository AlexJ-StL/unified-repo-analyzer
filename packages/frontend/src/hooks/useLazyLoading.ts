/**
 * Hook for lazy loading large result sets with performance optimizations
 */

import type React from 'react';
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

interface LazyLoadingOptions {
  pageSize: number;
  initialLoad?: boolean;
  threshold?: number; // Distance from bottom to trigger load
}

interface LazyLoadingResult<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  setItems: (items: T[]) => void;
  error: string | null;
}

/**
 * Hook for implementing lazy loading with virtual scrolling support
 */
export function useLazyLoading<T>(
  loadFunction: (page: number, pageSize: number) => Promise<{ items: T[]; hasMore: boolean }>,
  options: LazyLoadingOptions
): LazyLoadingResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadingRef = useRef(false);
  const { pageSize, initialLoad = true } = options;

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await loadFunction(page, pageSize);

      setItems((prevItems) => [...prevItems, ...result.items]);
      setHasMore(result.hasMore);
      setPage((prevPage) => prevPage + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more items');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [loadFunction, page, pageSize, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    loadingRef.current = false;
  }, []);

  const setItemsDirectly = useCallback(
    (newItems: T[]) => {
      setItems(newItems);
      setPage(Math.ceil(newItems.length / pageSize));
      setHasMore(newItems.length % pageSize === 0);
    },
    [pageSize]
  );

  // Initial load
  useEffect(() => {
    if (initialLoad && items.length === 0 && !loadingRef.current) {
      loadMore();
    }
  }, [initialLoad, items.length, loadMore]);

  return {
    items,
    loading,
    hasMore,
    loadMore,
    reset,
    setItems: setItemsDirectly,
    error,
  };
}

/**
 * Hook for infinite scroll implementation
 */
export function useInfiniteScroll<T>(
  loadFunction: (page: number, pageSize: number) => Promise<{ items: T[]; hasMore: boolean }>,
  options: LazyLoadingOptions & { containerRef?: RefObject<HTMLElement> }
): LazyLoadingResult<T> & { scrollRef: RefObject<HTMLDivElement> } {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { threshold = 200, containerRef } = options;

  const lazyLoading = useLazyLoading(loadFunction, options);

  useEffect(() => {
    const container = containerRef?.current || scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      if (
        scrollHeight - scrollTop - clientHeight < threshold &&
        !lazyLoading.loading &&
        lazyLoading.hasMore
      ) {
        lazyLoading.loadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [lazyLoading.loading, lazyLoading.hasMore, lazyLoading.loadMore, threshold, containerRef]);

  return {
    ...lazyLoading,
    scrollRef,
  };
}

/**
 * Hook for virtual scrolling with lazy loading
 */
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
): {
  visibleItems: { index: number; item: T; style: React.CSSProperties }[];
  totalHeight: number;
  scrollToIndex: (index: number) => void;
} {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      index: i,
      item: items[i],
      style: {
        position: 'absolute' as const,
        top: i * itemHeight,
        height: itemHeight,
        width: '100%',
      },
    });
  }

  const scrollToIndex = useCallback(
    (index: number) => {
      if (scrollElementRef.current) {
        const scrollTop = index * itemHeight;
        scrollElementRef.current.scrollTop = scrollTop;
        setScrollTop(scrollTop);
      }
    },
    [itemHeight]
  );

  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    const handleScroll = () => {
      setScrollTop(element.scrollTop);
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    visibleItems,
    totalHeight,
    scrollToIndex,
  };
}

/**
 * Hook for paginated data with caching
 */
export function usePaginatedData<T>(
  loadFunction: (
    page: number,
    pageSize: number
  ) => Promise<{ items: T[]; total: number; hasMore: boolean }>,
  pageSize = 20
): {
  items: T[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  refresh: () => void;
} {
  const [cache, setCache] = useState<Map<number, T[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(
    async (page: number) => {
      // Check cache first
      if (cache.has(page)) {
        return cache.get(page)!;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await loadFunction(page - 1, pageSize); // Convert to 0-based

        // Update cache
        setCache((prev) => new Map(prev).set(page, result.items));

        // Update metadata
        setTotalItems(result.total);
        setTotalPages(Math.ceil(result.total / pageSize));
        setHasMore(result.hasMore);

        return result.items;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load page';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadFunction, pageSize, cache]
  );

  const goToPage = useCallback(
    async (page: number) => {
      if (page < 1 || (totalPages > 0 && page > totalPages)) return;

      try {
        await loadPage(page);
        setCurrentPage(page);
      } catch (_err) {}
    },
    [loadPage, totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasMore && (totalPages === 0 || currentPage < totalPages)) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, hasMore, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const refresh = useCallback(() => {
    setCache(new Map());
    setError(null);
    goToPage(currentPage);
  }, [currentPage, goToPage]);

  // Load initial page
  useEffect(() => {
    goToPage(1);
  }, [goToPage]);

  const items = cache.get(currentPage) || [];

  return {
    items,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    hasMore,
    goToPage,
    nextPage,
    prevPage,
    refresh,
  };
}
