/**
 * Format file size in bytes to a human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date string to a human-readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

/**
 * Truncate text to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Convert camelCase to Title Case
 */
export const camelToTitleCase = (camelCase: string): string => {
  const result = camelCase.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

/**
 * Get file extension from path
 */
export const getFileExtension = (path: string): string => {
  return path.split('.').pop() || '';
};

/**
 * Get language from file extension
 */
export const getLanguageFromExtension = (extension: string): string => {
  const extensionMap: Record<string, string> = {
    js: 'JavaScript',
    ts: 'TypeScript',
    jsx: 'React JSX',
    tsx: 'React TSX',
    py: 'Python',
    java: 'Java',
    rb: 'Ruby',
    php: 'PHP',
    go: 'Go',
    rs: 'Rust',
    c: 'C',
    cpp: 'C++',
    cs: 'C#',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    json: 'JSON',
    md: 'Markdown',
    yml: 'YAML',
    yaml: 'YAML',
    xml: 'XML',
    sh: 'Shell',
    bat: 'Batch',
    ps1: 'PowerShell',
  };

  return extensionMap[extension.toLowerCase()] || 'Unknown';
};
