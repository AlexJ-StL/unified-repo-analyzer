import { vi } from 'vitest';

if (typeof globalThis.vi === 'undefined') {
  globalThis.vi = vi;
}

beforeAll(() => {
  if (typeof process !== 'undefined') {
    process.env.NODE_ENV = 'test';
  }
});
