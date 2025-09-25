/**
 * Typed Vitest mock for a Conf-style key-value store used in tests.
 * Methods are jest.fn when available; otherwise they are no-ops.
 */
export interface ConfLike {
  get: (key: string) => string | number | boolean | null;
  set: (key: string, value: string | number | boolean | null) => void;
  has: (key: string) => boolean;
  delete: (key: string) => void;
  clear: () => void;
}

// Fallback to global jest if present

const withVitest = <T extends (...args: never[]) => unknown>(fn: T): T => {
  return vi.fn(fn) as unknown as T;
};

const createInstance = (): ConfLike => {
  return {
    get: withVitest((_: string) => null),
    set: withVitest((_: string, __: unknown) => {}),
    has: withVitest((_: string) => false),
    delete: withVitest((_: string) => {}),
    clear: withVitest(() => {}),
  };
};

// CommonJS default export compatibility for Vitest module mocking.
// In JS tests, this is used as a constructor-like function: Conf()
const factory = () => createInstance();

const defaultExport = vi.fn(factory);

export default defaultExport as unknown as () => ConfLike;
