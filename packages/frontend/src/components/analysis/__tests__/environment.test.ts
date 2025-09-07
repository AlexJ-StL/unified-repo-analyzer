import { describe, it, expect } from 'vitest';

describe('Environment Test', () => {
  it('should show current environment', () => {
    console.log('Environment check:');
    console.log('typeof document:', typeof document);
    console.log('typeof window:', typeof window);
    console.log('typeof globalThis:', typeof globalThis);
    console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
    
    if (typeof document !== 'undefined') {
      console.log('document is available');
    } else {
      console.log('document is NOT available');
    }
    
    if (typeof window !== 'undefined') {
      console.log('window is available');
    } else {
      console.log('window is NOT available');
    }
    
    // This should pass in JSDOM environment
    expect(true).toBe(true);
  });
});
