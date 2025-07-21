/**
 * LLM Provider-related interfaces and types
 */

export interface ProviderConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface ProjectInfo {
  name: string;
  description?: string;
  language: string | null;
  fileCount: number;
  directoryCount: number;
  directories: string[];
  keyFiles: string[];
  dependencies?: Record<string, string> | null;
  devDependencies?: Record<string, string> | null;
  readme?: string | null;
  fileAnalysis: FileAnalysis[];
}

export interface FileAnalysis {
  path: string;
  lineCount: number;
  functionCount: number;
  classCount: number;
  importCount: number;
  comments: string[];
  functions: string[];
  classes: string[];
  sample?: string;
}
