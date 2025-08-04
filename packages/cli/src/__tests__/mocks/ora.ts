/**
 * Typed Jest mock for a minimal Ora-like spinner API used by tests.
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
const j: any = (globalThis as any).jest;

const self: OraLike = {
  start: () => self,
  succeed: () => self,
  fail: () => self,
  stop: () => self,
  text: '',
};

// Wrap in jest.fn() when available to preserve call tracking in tests.
const withJestIfAvailable = <T extends (...args: any[]) => any>(fn: T): T => {
  return typeof j?.fn === 'function' ? (j.fn(fn) as unknown as T) : fn;
};

const factory = () => {
  // Return a shallow proxy with chainable methods possibly wrapped by jest.fn
  return {
    start: withJestIfAvailable(self.start),
    succeed: withJestIfAvailable(self.succeed),
    fail: withJestIfAvailable(self.fail),
    stop: withJestIfAvailable(self.stop),
    get text() {
      return self.text;
    },
    set text(v: string) {
      self.text = v;
    },
  } as OraLike;
};

// CommonJS default export compatibility for Jest module mocking.
export default (typeof j?.fn === 'function' ? j.fn(factory) : (factory as unknown)) as unknown as {
  // When used as a function call in tests: ora()
  (): OraLike;
};
