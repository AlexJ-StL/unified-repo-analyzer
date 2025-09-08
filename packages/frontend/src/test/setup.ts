// @ts-nocheck - Disable TypeScript checking for this setup file
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { JSDOM } from 'jsdom';
import { afterEach, vi } from 'vitest';

// Export vi for global access
export { vi };

// Make vi globally available for Bun tests
if (typeof globalThis.vi === 'undefined') {
  globalThis.vi = vi;
}

// Setup jsdom environment if not already available
if (typeof document === 'undefined') {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
    resources: 'usable',
  });

  // Make jsdom globals available
  globalThis.window = dom.window as any;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.HTMLInputElement = dom.window.HTMLInputElement;
  globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
  globalThis.Element = dom.window.Element;
  globalThis.Node = dom.window.Node;
}

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
if (typeof globalThis.window !== 'undefined') {
  Object.defineProperty(globalThis.window, 'matchMedia', {
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
}

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin = '0px';
  thresholds: number[] = [0];

  constructor(_callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.root = options?.root ? (options.root as Element) : null;
    this.rootMargin = options?.rootMargin || '0px';
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : options?.threshold !== undefined
        ? [options.threshold]
        : [0];
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// Mock PerformanceObserver
globalThis.PerformanceObserver = class PerformanceObserver {
  constructor(public callback: PerformanceObserverCallback) {}

  observe() {}
  disconnect() {}
  takeRecords(): PerformanceEntryList {
    return [];
  }

  // Add static property to fix TypeScript error
  static supportedEntryTypes: readonly string[] = [];
};

// Mock performance.getEntriesByType
if (typeof globalThis.window !== 'undefined' && globalThis.window.performance) {
  Object.defineProperty(globalThis.window, 'performance', {
    writable: true,
    value: {
      ...globalThis.window.performance,
      getEntriesByType: () => [],
      mark: () => {},
      measure: () => {},
      now: () => Date.now(),
    },
  });
}
