/**
 * Type declarations for enhanced test setup
 */

declare global {
  // Enhanced global test utilities
  namespace Vi {
    interface MockedFunction<T extends (...args: any[]) => any> extends MockedFunction<T> {
      mockResolvedValue(value: Awaited<ReturnType<T>>): this;
      mockRejectedValue(value: any): this;
    }
  }

  // Global test environment variables
  interface ProcessEnv {
    NODE_ENV: 'test' | 'development' | 'production';
    CI?: string;
    SILENT_TESTS?: string;
    TEST_TIMEOUT?: string;
  }

  // Enhanced console interface for tests
  interface Console {
    debug: (...args: any[]) => void;
    trace: (...args: any[]) => void;
  }
}

// Module augmentation for better mock typing
declare module 'vitest' {
  interface MockedFunction<T extends (...args: any[]) => any> {
    mockResolvedValue(value: Awaited<ReturnType<T>>): this;
    mockRejectedValue(value: any): this;
  }
}
