/**
 * Type declarations for enhanced test setup
 */

// Global test environment variables
declare global {
  interface ProcessEnv {
    NODE_ENV: 'test' | 'development' | 'production';
    CI?: string;
    SILENT_TESTS?: string;
    TEST_TIMEOUT?: string;
  }
}

export {};
