/**
 * Typed Jest-like mock for a Conf-style key-value store used in tests.
 * Methods are jest.fn when available; otherwise they are no-ops.
 */
export interface ConfLike {
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  has: (key: string) => boolean;
  delete: (key: string) => void;
  clear: () => void;
}

// Fallback to global jest if present
const j: any = (globalThis as any).jest;

const identity = <T extends (...args: any[]) => any>(fn: T): T => {
  return typeof j?.fn === 'function' ? (j.fn(fn) as unknown as T) : fn;
};

const createInstance = (): ConfLike => {
  return {
    get: identity((_: string) => undefined),
    set: identity((_: string, __: unknown) => {}),
    has: identity((_: string) => false),
    delete: identity((_: string) => {}),
    clear: identity(() => {}),
  };
};

// CommonJS default export compatibility for Jest module mocking.
// In JS tests, this is used as a constructor-like function: Conf()
const factory = () => createInstance();

const defaultExport = typeof j?.fn === 'function' ? j.fn(factory) : (factory as unknown);

export default defaultExport as unknown as () => ConfLike;
