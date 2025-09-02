import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Export vi for global access
export { vi };

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin = "0px";
  thresholds: number[];

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {
    this.root = options?.root ? (options.root as Element) : null; // Cast Element | Document | null to Element | null
    this.rootMargin = options?.rootMargin || "0px";
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : options?.threshold !== undefined
        ? [options.threshold]
        : [0]; // Default to [0] if not specified
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// Mock PerformanceObserver
global.PerformanceObserver = class PerformanceObserver {
  constructor(public callback: PerformanceObserverCallback) {}

  observe() {}
  disconnect() {}
  takeRecords(): PerformanceEntryList {
    return [];
  }
};

// Mock performance.getEntriesByType
Object.defineProperty(window, "performance", {
  writable: true,
  value: {
    ...window.performance,
    getEntriesByType: () => [],
    mark: () => {},
    measure: () => {},
    now: () => Date.now(),
  },
});
