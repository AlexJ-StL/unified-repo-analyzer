/**
 * Typed Vitest mock for a minimal subset of chalk used by tests.
 * Exposes functions that echo input to keep snapshot/output stable.
 *
 * We avoid importing Vitest types; use `any`-based signatures to remain compatible
 * whether tests run with Vitest or other test runners. We wrap functions with `vi.fn`
 * to preserve call tracking in tests.
 */

// Minimal function type used by these mocks
type ChalkFn = (text: string) => string;

// Surface used by tests
export interface ChalkMock {
  blue: ChalkFn & { mock?: { calls: string[][] } };
  green: ChalkFn & { mock?: { calls: string[][] } };
  red: {
    bold: ChalkFn & { mock?: { calls: string[][] } };
  };
  yellow: ChalkFn & { mock?: { calls: string[][] } };
  gray: ChalkFn & { mock?: { calls: string[][] } };
}

// Access global jest if available at runtime

// Identity function returns the passed text
const identity = (t: string): string => t;

// Helper: wrap a function with jest.fn when available, otherwise return original
function withVitest<T extends (...args: never[]) => unknown>(fn: T): T {
  return vi.fn(fn) as unknown as T;
}

const chalkMock: ChalkMock = {
  blue: withVitest(identity) as unknown as ChalkMock['blue'],
  green: withVitest(identity) as unknown as ChalkMock['green'],
  red: {
    bold: withVitest(identity) as unknown as ChalkMock['red']['bold'],
  },
  yellow: withVitest(identity) as unknown as ChalkMock['yellow'],
  gray: withVitest(identity) as unknown as ChalkMock['gray'],
};

export default chalkMock;
