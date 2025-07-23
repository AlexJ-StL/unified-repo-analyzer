import Conf from 'conf';
import { AnalysisOptions } from '@unified-repo-analyzer/shared';

interface ConfigSchema {
  apiUrl: string;
  defaultOptions: Partial<AnalysisOptions>;
  outputDir: string;
}

// Create config instance with defaults
const config = new Conf<ConfigSchema>({
  projectName: 'unified-repo-analyzer',
  defaults: {
    apiUrl: 'http://localhost:3000/api',
    defaultOptions: {
      mode: 'standard',
      maxFiles: 500,
      maxLinesPerFile: 1000,
      includeLLMAnalysis: true,
      llmProvider: 'claude',
      outputFormats: ['json'],
      includeTree: true,
    },
    outputDir: './analysis-results',
  },
});

export default config;
