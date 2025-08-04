/**
 * Typed Jest mock for a minimal subset of chalk used by tests.
 * Exposes functions that echo input to keep snapshot/output stable.
 *
 * We avoid importing Jest types; use `any`-based signatures to remain compatible
 * whether tests run with Jest, Vitest, or Bun's test adaptors. If a global `jest`
 * is present, we wrap functions with `jest.fn` to preserve call tracking.
 */

// Minimal function type used by these mocks
type ChalkFn = (text: string) => string;

// Surface used by tests
export interface ChalkMock {
  blue: ChalkFn & { mock?: unknown };
  green: ChalkFn & { mock?: unknown };
  red: {
    bold: ChalkFn & { mock?: unknown };
  };
  yellow: ChalkFn & { mock?: unknown };
  gray: ChalkFn & { mock?: unknown };
}

// Access global jest if available at runtime
const j: any = (globalThis as any).jest;

// Identity function returns the passed text
const identity = (t: string): string => t;

// Helper: wrap a function with jest.fn when available, otherwise return original
function withJestIfAvailable<T extends (...args: any[]) => any>(fn: T): T {
  return typeof j?.fn === 'function' ? (j.fn(fn) as unknown as T) : fn;
}

const chalkMock: ChalkMock = {
  blue: withJestIfAvailable(identity) as unknown as ChalkMock['blue'],
  green: withJestIfAvailable(identity) as unknown as ChalkMock['green'],
  red: {
    bold: withJestIfAvailable(identity) as unknown as ChalkMock['red']['bold'],
  },
  yellow: withJestIfAvailable(identity) as unknown as ChalkMock['yellow'],
  gray: withJestIfAvailable(identity) as unknown as ChalkMock['gray'],
};

export default chalkMock;
