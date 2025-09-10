/**
 * Configuration-related interfaces and types
 */
export const DEFAULT_ANALYSIS_MODE_PRESETS = [
  {
    name: 'quick',
    displayName: 'Quick Analysis',
    description: 'Fast overview focusing on structure and basic metrics',
    maxFiles: 100,
    maxLinesPerFile: 500,
    includeLLMAnalysis: false,
    includeTree: true,
    estimatedTime: '< 1 minute',
    recommended: false,
  },
  {
    name: 'standard',
    displayName: 'Standard Analysis',
    description: 'Balanced analysis with LLM insights and comprehensive metrics',
    maxFiles: 500,
    maxLinesPerFile: 1000,
    includeLLMAnalysis: true,
    includeTree: true,
    estimatedTime: '2-5 minutes',
    recommended: true,
  },
  {
    name: 'comprehensive',
    displayName: 'Comprehensive Analysis',
    description: 'Deep analysis with full LLM processing and detailed insights',
    maxFiles: 2000,
    maxLinesPerFile: 5000,
    includeLLMAnalysis: true,
    includeTree: true,
    estimatedTime: '10-30 minutes',
    recommended: false,
  },
];
export const DEFAULT_USER_PREFERENCES = {
  general: {
    autoSave: true,
    autoIndex: true,
    enableNotifications: true,
    theme: 'system',
    language: 'en',
  },
  analysis: {
    defaultMode: 'standard',
    maxFiles: 500,
    maxLinesPerFile: 1000,
    includeLLMAnalysis: true,
    includeTree: true,
    ignorePatterns: [
      'node_modules/',
      '.git/',
      '.svn/',
      '.hg/',
      'dist/',
      'build/',
      'coverage/',
      '*.log',
      '*.tmp',
      '.DS_Store',
      'Thumbs.db',
    ],
    maxFileSize: 1024 * 1024, // 1MB
    cacheDirectory: '~/.repo-analyzer/cache',
    cacheTTL: 24, // 24 hours
  },
  llmProvider: {
    defaultProvider: 'claude',
    providers: {
      claude: {
        name: 'Claude',
        maxTokens: 8000,
        temperature: 0.7,
        enabled: true,
      },
      gemini: {
        name: 'Gemini',
        maxTokens: 8000,
        temperature: 0.7,
        enabled: true,
      },
      mock: {
        name: 'Mock Provider',
        maxTokens: 8000,
        temperature: 0.7,
        enabled: true,
      },
    },
  },
  export: {
    defaultFormat: 'json',
    outputDirectory: './analysis-results',
    includeMetadata: true,
    compressLargeFiles: true,
    customTemplates: {},
  },
  ui: {
    compactMode: false,
    showAdvancedOptions: false,
    defaultView: 'grid',
    itemsPerPage: 20,
    enableAnimations: true,
  },
};
//# sourceMappingURL=config.js.map
