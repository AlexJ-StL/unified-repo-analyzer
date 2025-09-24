import { describe, expect, it } from 'vitest';

describe('Standalone Test Suite', () => {
  describe('Basic Math Operations', () => {
    it('should add two numbers correctly', () => {
      expect(1 + 1).toBe(2);
      expect(2 + 3).toBe(5);
      expect(10 + 15).toBe(25);
    });

    it('should subtract numbers correctly', () => {
      expect(5 - 3).toBe(2);
      expect(10 - 4).toBe(6);
    });

    it('should multiply numbers correctly', () => {
      expect(2 * 3).toBe(6);
      expect(5 * 4).toBe(20);
    });
  });

  describe('String Operations', () => {
    it('should handle string length', () => {
      expect('hello'.length).toBe(5);
      expect(''.length).toBe(0);
      expect('test string'.length).toBe(11);
    });

    it('should split strings correctly', () => {
      expect('hello world'.split(' ')).toEqual(['hello', 'world']);
      expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
    });

    it('should convert case correctly', () => {
      expect('hello'.toUpperCase()).toBe('HELLO');
      expect('WORLD'.toLowerCase()).toBe('world');
    });
  });

  describe('Array Operations', () => {
    it('should handle array length', () => {
      expect([1, 2, 3].length).toBe(3);
      expect([]).toHaveLength(0);
    });

    it('should access array elements', () => {
      const arr = [10, 20, 30];
      expect(arr[0]).toBe(10);
      expect(arr[1]).toBe(20);
      expect(arr[2]).toBe(30);
    });

    it('should check array contents', () => {
      const arr = ['a', 'b', 'c'];
      expect(arr).toContain('a');
      expect(arr).toContain('b');
      expect(arr).not.toContain('d');
    });
  });

  describe('Boolean Logic', () => {
    it('should handle boolean values', () => {
      expect(true).toBe(true);
      expect(false).toBe(false);
      expect(!true).toBe(false);
      expect(!false).toBe(true);
    });

    it('should handle comparisons', () => {
      expect(5 > 3).toBe(true);
      expect(3 < 5).toBe(true);
      expect(5 !== 3).toBe(true);
    });
  });
});
