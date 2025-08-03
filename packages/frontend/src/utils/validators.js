/**
 * Validate if a string is a valid file path
 */
export const isValidFilePath = (path) => {
    // Basic path validation - this is a simplified version
    // In a real app, you might want more sophisticated validation
    if (!path || path.trim() === '')
        return false;
    // Check for invalid characters in Windows paths
    const invalidCharsWindows = /[<>:"|?*]/;
    if (invalidCharsWindows.test(path))
        return false;
    return true;
};
/**
 * Validate if a string is a valid URL
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
/**
 * Validate if a value is a positive number
 */
export const isPositiveNumber = (value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
};
/**
 * Validate if a string is a valid API key format
 * This is a simple example - actual validation would depend on the API key format
 */
export const isValidApiKey = (apiKey) => {
    // This is a simple check - adjust based on your actual API key format
    return apiKey && apiKey.length >= 8;
};
/**
 * Validate analysis options
 */
export const validateAnalysisOptions = (options) => {
    const errors = [];
    if (!options.mode || !['quick', 'standard', 'comprehensive'].includes(options.mode)) {
        errors.push('Invalid analysis mode');
    }
    if (!isPositiveNumber(options.maxFiles)) {
        errors.push('Max files must be a positive number');
    }
    if (!isPositiveNumber(options.maxLinesPerFile)) {
        errors.push('Max lines per file must be a positive number');
    }
    if (!options.llmProvider) {
        errors.push('LLM provider is required');
    }
    if (!options.outputFormats || options.outputFormats.length === 0) {
        errors.push('At least one output format is required');
    }
    return errors;
};
//# sourceMappingURL=validators.js.map