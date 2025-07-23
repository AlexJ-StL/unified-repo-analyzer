/**
 * Analysis-related interfaces and types
 */

import { DirectoryInfo, FileInfo, IndexedRepository } from './repository';

export type AnalysisMode = 'quick' | 'standard' | 'comprehensive';
export type OutputFormat = 'json' | 'markdown' | 'html';

export interface AnalysisOptions {
  mode: AnalysisMode;
  maxFiles: number;
  maxLinesPerFile: number;
  includeLLMAnalysis: boolean;
  llmProvider: string;
  outputFormats: OutputFormat[];
  includeTree: boolean;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export interface ComplexityMetrics {
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  technicalDebt: string;
  codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ArchitecturalPattern {
  name: string;
  confidence: number;
  description: string;
}

export interface RepositoryAnalysis {
  id: string;
  path: string;
  name: string;
  description?: string;
  language: string;
  languages: string[];
  frameworks: string[];
  fileCount: number;
  directoryCount: number;
  totalSize: number;
  createdAt: Date;
  updatedAt: Date;

  structure: {
    directories: DirectoryInfo[];
    keyFiles: FileInfo[];
    tree: string;
  };

  codeAnalysis: {
    functionCount: number;
    classCount: number;
    importCount: number;
    complexity: ComplexityMetrics;
    patterns: ArchitecturalPattern[];
  };

  dependencies: {
    production: any[];
    development: any[];
    frameworks: any[];
  };

  insights: {
    executiveSummary: string;
    technicalBreakdown: string;
    recommendations: string[];
    potentialIssues: string[];
  };

  metadata: {
    analysisMode: AnalysisMode;
    llmProvider?: string;
    processingTime: number;
    tokenUsage?: TokenUsage;
  };
}

export interface BatchAnalysisResult {
  id: string;
  repositories: RepositoryAnalysis[];
  combinedInsights?: {
    commonalities: string[];
    differences: string[];
    integrationOpportunities: string[];
  };
  createdAt: Date;
  processingTime: number;
  status?: {
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
    pending: number;
    progress: number;
  };
}

export interface SearchQuery {
  languages?: string[];
  frameworks?: string[];
  keywords?: string[];
  fileTypes?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchResult {
  repository: IndexedRepository;
  score: number;
  matches: {
    field: string;
    value: string;
    score: number;
  }[];
}

export interface CombinationSuggestion {
  repositories: string[];
  compatibility: number;
  rationale: string;
  integrationPoints: string[];
}
