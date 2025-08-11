/**
 * Analysis-related interfaces and types
 */

import type {
  Dependency,
  DirectoryInfo,
  FileInfo,
  Framework,
  IndexedRepository,
} from './repository';

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
    production: Dependency[];
    development: Dependency[];
    frameworks: Framework[];
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
  // Pagination and sorting
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Repository comparison
  compareRepositories?: string[];
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

export interface RelationshipGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
}

export interface GraphNode {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'mobile' | 'library' | 'tool' | 'application';
  size: number;
  complexity: number;
  languages: string[];
  frameworks: string[];
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'similar' | 'complementary' | 'dependency' | 'fork';
  strength: number;
  reason: string;
}

export interface GraphCluster {
  id: string;
  name: string;
  repositories: string[];
  theme: string;
  color: string;
}

export interface IntegrationOpportunity {
  id: string;
  repositories: string[];
  type: 'full-stack' | 'microservices' | 'library-ecosystem' | 'mobile-backend' | 'tool-chain';
  title: string;
  description: string;
  benefits: string[];
  challenges: string[];
  implementationSteps: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  priority: number;
}

export interface RelationshipInsights {
  totalRepositories: number;
  totalRelationships: number;
  strongRelationships: number;
  clusters: number;
  topLanguages: { language: string; count: number }[];
  topFrameworks: { framework: string; count: number }[];
  architecturalPatterns: { pattern: string; count: number }[];
  integrationOpportunities: IntegrationOpportunity[];
}
