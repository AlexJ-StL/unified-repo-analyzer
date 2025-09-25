/**
 * Typed Vitest mock for a minimal Ora-like spinner API used by tests.
 * Methods are chainable (return this) and `text` is a mutable string.
 */
export interface OraLike {
  start: () => OraLike;
  succeed: () => OraLike;
  fail: () => OraLike;
  stop: () => OraLike;
  text: string;
}

// Using any for jest in case @types/jest aren't available in this package scope.
// TODO: If Jest types are available, replace `any` with proper jest.Mock type.

const self: OraLike = {
  start: () => self,
  succeed: () => self,
  fail: () => self,
  stop: () => self,
  text: '',
};

// Wrap in jest.fn() when available to preserve call tracking in tests.
const withVitest = <T extends (...args: unknown[]) => unknown>(fn: T): T =>
  vi.fn(fn) as unknown as T;

const factory = () => {
  // Return a shallow proxy with chainable methods possibly wrapped by jest.fn
  return {
    start: withVitest(self.start),
    succeed: withVitest(self.succeed),
    fail: withVitest(self.fail),
    stop: withVitest(self.stop),
    get text() {
      return self.text;
    },
    set text(v: string) {
      self.text = v;
    },
  } as OraLike;
};

// CommonJS default export compatibility for Vitest module mocking.
export default vi.fn(factory) as unknown as () => OraLike;
