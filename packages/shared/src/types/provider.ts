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

/**
 * OpenRouter-specific model information
 */
export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: number;
    completion: number;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider?: {
    context_length: number;
    max_completion_tokens?: number;
    is_moderated: boolean;
  };
  per_request_limits?: {
    prompt_tokens: string;
    completion_tokens: string;
  };
}

/**
 * Provider model information (generic)
 */
export interface ProviderModel {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
  maxTokens?: number;
  pricing?: {
    input?: number;
    output?: number;
  };
  capabilities?: string[];
}
