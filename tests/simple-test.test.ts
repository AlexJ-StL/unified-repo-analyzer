import { describe, expect, it } from 'vitest';

describe('Simple Test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle basic string operations', () => {
    expect('hello'.length).toBe(5);
    expect('hello world'.split(' ')).toEqual(['hello', 'world']);
  });

  it('should handle basic array operations', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr[0]).toBe(1);
  });
});
