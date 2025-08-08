/**
 * Validate if a string is a valid file path
 */
export const isValidFilePath = (path: string): boolean => {
  // Basic path validation - this is a simplified version
  // In a real app, you might want more sophisticated validation
  if (!path || path.trim() === '') return false;

  // Check for invalid characters in Windows paths
  const invalidCharsWindows = /[<>:"|?*]/;
  if (invalidCharsWindows.test(path)) return false;

  return true;
};

/**
 * Validate if a string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate if a value is a positive number
 */
export const isPositiveNumber = (value: unknown): boolean => {
  const num = Number(value);
  return !Number.isNaN(num) && num > 0;
};

/**
 * Validate if a string is a valid API key format
 * This is a simple example - actual validation would depend on the API key format
 */
export const isValidApiKey = (apiKey: string): boolean => {
  // This is a simple check - adjust based on your actual API key format
  return Boolean(apiKey && apiKey.length >= 8);
};

/**
 * Validate analysis options
 */
export const validateAnalysisOptions = (options: unknown): string[] => {
  const errors: string[] = [];

  if (!options || typeof options !== 'object') {
    errors.push('Options must be an object');
    return errors;
  }

  const opts = options as Record<string, unknown>;

  if (!opts.mode || !['quick', 'standard', 'comprehensive'].includes(opts.mode as string)) {
    errors.push('Invalid analysis mode');
  }

  if (!isPositiveNumber(opts.maxFiles)) {
    errors.push('Max files must be a positive number');
  }

  if (!isPositiveNumber(opts.maxLinesPerFile)) {
    errors.push('Max lines per file must be a positive number');
  }

  if (!opts.llmProvider) {
    errors.push('LLM provider is required');
  }

  if (
    !opts.outputFormats ||
    !Array.isArray(opts.outputFormats) ||
    opts.outputFormats.length === 0
  ) {
    errors.push('At least one output format is required');
  }

  return errors;
};
