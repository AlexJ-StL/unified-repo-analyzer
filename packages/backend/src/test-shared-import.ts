// Test shared package import
import type { AnalysisOptions } from '@unified-repo-analyzer/shared';

const _test: AnalysisOptions = {
  mode: 'standard',
  maxFiles: 100,
  maxLinesPerFile: 1000,
  includeLLMAnalysis: false,
  llmProvider: 'none',
  outputFormats: ['json'],
  includeTree: true,
};

console.log('Shared package import test successful');
