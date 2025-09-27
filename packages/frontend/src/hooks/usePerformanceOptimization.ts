/**
 * Hook for performance optimization utilities
 */

import { type DependencyList, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { performanceService } from '../services/performance.service';

/**
 * Hook for debouncing function calls
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook for throttling function calls
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            lastCallRef.current = Date.now();
            callback(...args);
          },
          delay - (now - lastCallRef.current)
        );
      }
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * Hook for memoizing expensive computations with cache invalidation
 */
export function useMemoWithInvalidation<T>(
  factory: () => T,
  deps: DependencyList,
  invalidateAfter?: number
): T {
  const cacheRef = useRef<{
    value: T;
    timestamp: number;
    deps: DependencyList;
  }>();

  return useMemo(() => {
    const now = Date.now();

    // Check if cache is valid
    if (
      cacheRef.current &&
      JSON.stringify(cacheRef.current.deps) === JSON.stringify(deps) &&
      (!invalidateAfter || now - cacheRef.current.timestamp < invalidateAfter)
    ) {
      return cacheRef.current.value;
    }

    // Compute new value
    const value = factory();
    cacheRef.current = {
      value,
      timestamp: now,
      deps: [...deps],
    };

    return value;
  }, [deps, factory, invalidateAfter]);
}

/**
 * Hook for measuring component render performance
 */
export function useRenderPerformance(componentName: string, props?: Record<string, unknown>) {
  const renderStartRef = useRef<number>();

  useEffect(() => {
    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    if (renderStartRef.current) {
      const renderTime = performance.now() - renderStartRef.current;
      performanceService.recordComponentRender(componentName, renderTime, props);
    }
  });

  return {
    startTimer: () => {
      renderStartRef.current = performance.now();
    },
    endTimer: () => {
      if (renderStartRef.current) {
        const renderTime = performance.now() - renderStartRef.current;
        performanceService.recordComponentRender(componentName, renderTime, props);
        return renderTime;
      }
      return 0;
    },
  };
}

/**
 * Hook for intersection observer with performance optimizations
 */
export function useIntersectionObserver(options: IntersectionObserverInit = {}): {
  ref: React.RefCallback<Element>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
} {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observerRef = useRef<IntersectionObserver>();

  const ref = useCallback(
    (element: Element | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (element) {
        observerRef.current = new IntersectionObserver(
          ([entry]) => {
            setIsIntersecting(entry.isIntersecting);
            setEntry(entry);
          },
          {
            threshold: 0.1,
            rootMargin: '50px',
            ...options,
          }
        );

        observerRef.current.observe(element);
      }
    },
    [options.threshold, options.rootMargin, options.root, options]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { ref, isIntersecting, entry };
}

/**
 * Hook for optimized event listeners
 */
export function useOptimizedEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | Element | null = window,
  options: AddEventListenerOptions = {}
): void {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element) return;

    const eventListener = (event: Event) => {
      savedHandler.current(event as WindowEventMap[K]);
    };

    const optimizedOptions = {
      passive: true,
      ...options,
    };

    element.addEventListener(eventName, eventListener, optimizedOptions);

    return () => {
      element.removeEventListener(eventName, eventListener, optimizedOptions);
    };
  }, [eventName, element, options.capture, options.once, options.passive, options]);
}

/**
 * Hook for batch updates to reduce re-renders
 */
export function useBatchUpdates<T>(): {
  values: T[];
  addValue: (value: T) => void;
  flush: () => void;
  clear: () => void;
} {
  const [values, setValues] = useState<T[]>([]);
  const batchRef = useRef<T[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const flush = useCallback(() => {
    if (batchRef.current.length > 0) {
      setValues((prev) => [...prev, ...batchRef.current]);
      batchRef.current = [];
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const addValue = useCallback(
    (value: T) => {
      batchRef.current.push(value);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(flush, 16); // Batch for one frame
    },
    [flush]
  );

  const clear = useCallback(() => {
    setValues([]);
    batchRef.current = [];
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { values, addValue, flush, clear };
}

/**
 * Hook for image lazy loading with performance optimizations
 */
export function useImageLazyLoading(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (isIntersecting && src && !isLoaded && !isError) {
      const img = new Image();

      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        performanceService.recordMetric('image.load.success', performance.now(), {
          src: src.substring(0, 50),
        });
      };

      img.onerror = () => {
        setIsError(true);
        performanceService.recordMetric('image.load.error', performance.now(), {
          src: src.substring(0, 50),
        });
      };

      img.src = src;
    }
  }, [isIntersecting, src, isLoaded, isError]);

  return {
    ref,
    src: imageSrc,
    isLoaded,
    isError,
    isIntersecting,
  };
}
