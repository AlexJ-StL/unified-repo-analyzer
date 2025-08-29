
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
 * Enhanced path validation with platform-specific checks
 */
export const validateRepositoryPath = (path: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!path || path.trim() === '') {
    errors.push('Path cannot be empty');
    return { isValid: false, errors };
  }

  const trimmedPath = path.trim();

  // Check for invalid characters based on platform
  if (navigator.platform.toLowerCase().includes('win')) {
    // Windows-specific validation
    const invalidCharsWindows = /[<>:"|?*]/;
    if (invalidCharsWindows.test(trimmedPath)) {
      errors.push('Path contains invalid characters for Windows: < > : " | ? *');
    }

    // Check for reserved names
    const reservedNames = [
      'CON',
      'PRN',
      'AUX',
      'NUL',
      'COM1',
      'COM2',
      'COM3',
      'COM4',
      'COM5',
      'COM6',
      'COM7',
      'COM8',
      'COM9',
      'LPT1',
      'LPT2',
      'LPT3',
      'LPT4',
      'LPT5',
      'LPT6',
      'LPT7',
      'LPT8',
      'LPT9',
    ];
    const pathParts = trimmedPath.split(/[/\\]/);
    for (const part of pathParts) {
      if (reservedNames.includes(part.toUpperCase())) {
        errors.push(`Path contains reserved name: ${part}`);
      }
    }

    // Check path length (Windows has a 260 character limit by default)
    if (trimmedPath.length > 260) {
      errors.push('Path is too long for Windows (maximum 260 characters)');
    }

    // Check for valid drive letter format
    if (trimmedPath.match(/^[a-zA-Z]:/)) {
      // Valid drive letter format
    } else if (trimmedPath.startsWith('\\\\')) {
      // UNC path - basic validation
      if (!trimmedPath.match(/^\\\\[^\\]+\\[^\\]+/)) {
        errors.push('Invalid UNC path format. Use \\\\server\\share\\path');
      }
    } else if (
      !trimmedPath.startsWith('/') &&
      !trimmedPath.startsWith('./') &&
      !trimmedPath.startsWith('../')
    ) {
      errors.push(
        'Path must start with a drive letter (C:), UNC path (\\\\server), or be relative'
      );
    }
  } else {
    // Unix-like systems (macOS, Linux)
    if (trimmedPath.includes('\0')) {
      errors.push('Path cannot contain null characters');
    }

    // Check for excessively long paths
    if (trimmedPath.length > 4096) {
      errors.push('Path is too long (maximum 4096 characters)');
    }
  }

  // Common validations
  if (trimmedPath.endsWith(' ') || trimmedPath.endsWith('.')) {
    errors.push('Path cannot end with spaces or dots');
  }

  if (trimmedPath.includes('//') || trimmedPath.includes('\\\\\\')) {
    errors.push('Path contains consecutive separators');
  }

  return { isValid: errors.length === 0, errors };
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
