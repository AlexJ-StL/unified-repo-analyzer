// Import setup first
import '../../../test/setup';

import { describe, it, expect } from 'vitest';

describe('Setup Test', () => {
  it('should have JSDOM globals after setup', () => {
    console.log('After setup import:');
    console.log('typeof document:', typeof document);
    console.log('typeof window:', typeof window);
    
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
  });
});