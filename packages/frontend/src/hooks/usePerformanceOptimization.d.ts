/**
 * Hook for performance optimization utilities
 */
import { DependencyList } from 'react';
/**
 * Hook for debouncing function calls
 */
export declare function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T;
/**
 * Hook for throttling function calls
 */
export declare function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T;
/**
 * Hook for memoizing expensive computations with cache invalidation
 */
export declare function useMemoWithInvalidation<T>(
  factory: () => T,
  deps: DependencyList,
  invalidateAfter?: number
): T;
/**
 * Hook for measuring component render performance
 */
export declare function useRenderPerformance(
  componentName: string,
  props?: Record<string, unknown>
): {
  startTimer: () => void;
  endTimer: () => number;
};
/**
 * Hook for intersection observer with performance optimizations
 */
export declare function useIntersectionObserver(options?: IntersectionObserverInit): {
  ref: React.RefCallback<Element>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
};
/**
 * Hook for optimized event listeners
 */
export declare function useOptimizedEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window | Element | null,
  options?: AddEventListenerOptions
): void;
/**
 * Hook for batch updates to reduce re-renders
 */
export declare function useBatchUpdates<T>(): {
  values: T[];
  addValue: (value: T) => void;
  flush: () => void;
  clear: () => void;
};
/**
 * Hook for image lazy loading with performance optimizations
 */
export declare function useImageLazyLoading(
  src: string,
  placeholder?: string
): {
  ref: (
    instance: Element | null
  ) =>
    | undefined
    | import('react').DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof import('react').DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES];
  src: string;
  isLoaded: boolean;
  isError: boolean;
  isIntersecting: boolean;
};
