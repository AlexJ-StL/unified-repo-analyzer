/// <reference types="vitest/globals" />

declare global {
  // Vitest globals
  const describe: typeof import('vitest').describe;
  const it: typeof import('vitest').it;
  const test: typeof import('vitest').test;
  const expect: typeof import('vitest').expect;
  const beforeEach: typeof import('vitest').beforeEach;
  const afterEach: typeof import('vitest').afterEach;
  const beforeAll: typeof import('vitest').beforeAll;
  const afterAll: typeof import('vitest').afterAll;
  const vi: typeof import('vitest').vi;

  // Jest compatibility for existing tests
  namespace jest {
    const fn: typeof vi.fn;
    const mock: typeof vi.mock;
    const clearAllMocks: typeof vi.clearAllMocks;
    const spyOn: typeof vi.spyOn;

    interface MockedFunction<T extends (...args: unknown[]) => unknown> {
      (...args: Parameters<T>): ReturnType<T>;
      mockReturnValue(value: ReturnType<T>): this;
      mockResolvedValue(value: Awaited<ReturnType<T>>): this;
      mockRejectedValue(value: unknown): this;
      mockImplementation(fn: T): this;
      mockClear(): this;
      toHaveBeenCalled(): void;
      toHaveBeenCalledWith(...args: Parameters<T>): void;
      toHaveBeenCalledTimes(times: number): void;
    }

    interface Mocked<_T> {
      [key: string]: unknown;
    }

    interface MockedClass<T> {
      new (...args: unknown[]): Mocked<T>;
    }

    interface Mock extends MockedFunction<unknown> {}
  }
}

export {};
