/**
 * Hook for lazy loading large result sets with performance optimizations
 */
import React, { RefObject } from 'react';
interface LazyLoadingOptions {
    pageSize: number;
    initialLoad?: boolean;
    threshold?: number;
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
export declare function useLazyLoading<T>(loadFunction: (page: number, pageSize: number) => Promise<{
    items: T[];
    hasMore: boolean;
}>, options: LazyLoadingOptions): LazyLoadingResult<T>;
/**
 * Hook for infinite scroll implementation
 */
export declare function useInfiniteScroll<T>(loadFunction: (page: number, pageSize: number) => Promise<{
    items: T[];
    hasMore: boolean;
}>, options: LazyLoadingOptions & {
    containerRef?: RefObject<HTMLElement>;
}): LazyLoadingResult<T> & {
    scrollRef: RefObject<HTMLDivElement>;
};
/**
 * Hook for virtual scrolling with lazy loading
 */
export declare function useVirtualScrolling<T>(items: T[], itemHeight: number, containerHeight: number, overscan?: number): {
    visibleItems: {
        index: number;
        item: T;
        style: React.CSSProperties;
    }[];
    totalHeight: number;
    scrollToIndex: (index: number) => void;
};
/**
 * Hook for paginated data with caching
 */
export declare function usePaginatedData<T>(loadFunction: (page: number, pageSize: number) => Promise<{
    items: T[];
    total: number;
    hasMore: boolean;
}>, pageSize?: number): {
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
};
export {};
