// Import setup first to ensure JSDOM environment
import '../../../test/setup';

import { describe, expect, it } from 'vitest';

describe('Simple JSDOM Test', () => {
  it('should have access to DOM globals', () => {
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
  });

  it('should be able to create DOM elements', () => {
    const div = document.createElement('div');
    expect(div).toBeInstanceOf(HTMLElement);
  });
});
