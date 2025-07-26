/**
 * Repository-related interfaces and types
 */

export interface FileInfo {
  path: string;
  language: string;
  size: number;
  lineCount: number;
  tokenCount?: number;
  importance: number;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  description?: string;
  useCase?: string;
}

export interface FunctionInfo {
  name: string;
  lineNumber: number;
  parameters: string[];
  description?: string;
}

export interface ClassInfo {
  name: string;
  lineNumber: number;
  methods: string[];
  description?: string;
}

export interface DirectoryInfo {
  path: string;
  files: number;
  subdirectories: number;
  role?: string;
}

export interface Dependency {
  name: string;
  version: string;
  type: 'production' | 'development';
  description?: string;
}

export interface Framework {
  name: string;
  version?: string;
  confidence: number;
}

export interface RepositoryRelationship {
  sourceId: string;
  targetId: string;
  type: 'similar' | 'complementary' | 'dependency' | 'fork';
  strength: number;
  reason: string;
}

export interface Tag {
  id: string;
  name: string;
  category?: string;
  color?: string;
}

export interface IndexedRepository {
  id: string;
  name: string;
  path: string;
  languages: string[];
  frameworks: string[];
  tags: string[];
  summary: string;
  lastAnalyzed: Date;
  size: number;
  complexity: number;
}
