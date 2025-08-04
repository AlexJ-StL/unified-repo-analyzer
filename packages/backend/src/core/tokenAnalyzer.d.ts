/**
 * Token counting and text sampling utilities
 */
/**
 * Simple token counting function
 * This is a basic approximation - actual LLM tokenization is more complex
 *
 * @param text - Text to count tokens for
 * @returns Approximate token count
 */
export declare function countTokens(text: string): number;
/**
 * Samples text to fit within token limits
 *
 * @param text - Text to sample
 * @param maxTokens - Maximum number of tokens
 * @param strategy - Sampling strategy
 * @returns Sampled text
 */
export declare function sampleText(
  text: string,
  maxTokens: number,
  strategy?: 'start' | 'end' | 'middle' | 'smart'
): string;
