/**
 * Tests for token analyzer
 */

import { describe, expect, test } from 'vitest';
import { countTokens, sampleText } from '../tokenAnalyzer';

describe('Token Analyzer', () => {
  describe('countTokens', () => {
    test('should count tokens in simple text', () => {
      const text = 'This is a simple test.';
      const count = countTokens(text);
      expect(count).toBe(5); // "This", "is", "a", "simple", "test"
    });

    test('should handle empty text', () => {
      expect(countTokens('')).toBe(0);
      expect(countTokens(null as any)).toBe(0);
      expect(countTokens(undefined as any)).toBe(0);
    });

    test('should handle text with punctuation', () => {
      const text = 'Hello, world! How are you today?';
      const count = countTokens(text);
      expect(count).toBe(6); // "Hello", "world", "How", "are", "you", "today"
    });

    test('should handle text with multiple spaces', () => {
      const text = 'This   has   multiple    spaces.';
      const count = countTokens(text);
      expect(count).toBe(4); // "This", "has", "multiple", "spaces"
    });
  });

  describe('sampleText', () => {
    test('should return original text if within token limit', () => {
      const text = 'This is a short text.';
      const sampled = sampleText(text, 10);
      expect(sampled).toBe(text);
    });

    test('should handle empty text', () => {
      expect(sampleText('', 10)).toBe('');
      expect(sampleText(null as any, 10)).toBe('');
      expect(sampleText(undefined as any, 10)).toBe('');
    });

    test('should sample from start', () => {
      const text = `Line 1
Line 2
Line 3
Line 4
Line 5`;

      const sampled = sampleText(text, 4, 'start');
      expect(sampled).toContain('Line 1');
      expect(sampled).toContain('Line 2');
      expect(sampled).toContain('... (truncated)');
      expect(sampled).not.toContain('Line 5');
    });

    test('should sample from end', () => {
      const text = `Line 1
Line 2
Line 3
Line 4
Line 5`;

      const sampled = sampleText(text, 4, 'end');
      expect(sampled).toContain('... (truncated)');
      expect(sampled).toContain('Line 4');
      expect(sampled).toContain('Line 5');
      expect(sampled).not.toContain('Line 1');
    });

    test('should sample from middle', () => {
      const text = `Line 1
Line 2
Line 3
Line 4
Line 5`;

      const sampled = sampleText(text, 3, 'middle');
      expect(sampled).toContain('... (truncated)');
      expect(sampled).toContain('Line 3');
      expect(sampled).not.toContain('Line 1');
      expect(sampled).not.toContain('Line 5');
    });

    test('should perform smart sampling', () => {
      const text = `# Important Header
Some regular text.

function importantFunction() {
  // Implementation
}

// Just a comment
const x = 1;

// TODO: Fix this later
const buggyCode = 'bug';

## Another Header
More text.`;

      const sampled = sampleText(text, 15, 'smart');

      // Should prioritize headers, functions, and TODO comments
      expect(sampled).toContain('# Important Header');
      expect(sampled).toContain('function importantFunction');
      expect(sampled).toContain('TODO: Fix this later');
    });
  });
});
