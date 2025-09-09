import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import type { FileInfo } from '@unified-repo-analyzer/shared/src/types/repository';
import { v4 as uuidv4 } from 'uuid';
import { sortFilesByImportance } from './fileImportance';
import { detectFrameworks, detectLanguage } from './languageDetection';

/**
 * Repository discovery and analysis utilities
 */

import type {
  AnalysisOptions,
  RepositoryAnalysis,
} from '@unified-repo-analyzer/shared/src/types/analysis';
import {
  extractDirectoryInfo,
  FileSystemError,
  FileSystemErrorType,
  getCombinedIgnorePatterns,
  type TraversalOptions,
  traverseDirectory,
} from './fileSystem.js';

const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

/**
 * Repository discovery options
 */
export interface RepositoryDiscoveryOptions {
  /**
   * Maximum number of files to process
   */
  maxFiles?: number;

  /**
   * Maximum number of lines per file
   */
  maxLinesPerFile?: number;

  /**
   * Custom ignore patterns
   */
  ignorePatterns?: string[];

  /**
   * Whether to include file content in the result
   */
  includeContent?: boolean;

  /**
   * Whether to include file tree in the result
   */
  includeTree?: boolean;
}

/**
 * Discovers and analyzes a repository
 *
 * @param repoPath - Path to the repository
 * @param options - Discovery options
 * @returns Promise resolving to repository analysis
 */
export async function discoverRepository(
  repoPath: string,
  options: RepositoryDiscoveryOptions = {}
): Promise<RepositoryAnalysis> {
  const {
    maxFiles = 1000,
    maxLinesPerFile = 1000,
    ignorePatterns = [],
    includeContent = false,
    includeTree = true,
  } = options;

  // Normalize and resolve the repository path
  const normalizedPath = path.resolve(repoPath);

  // Check if the directory exists
  try {
    const dirStats = await stat(normalizedPath);
    if (!dirStats.isDirectory()) {
      throw new FileSystemError(
        `Path is not a directory: ${normalizedPath}`,
        FileSystemErrorType.INVALID_PATH,
        normalizedPath
      );
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new FileSystemError(
        `Repository not found: ${normalizedPath}`,
        FileSystemErrorType.NOT_FOUND,
        normalizedPath
      );
    }
    if ((error as NodeJS.ErrnoException).code === 'EACCES') {
      throw new FileSystemError(
        `Permission denied: ${normalizedPath}`,
        FileSystemErrorType.PERMISSION_DENIED,
        normalizedPath
      );
    }
    throw new FileSystemError(
      `Error accessing repository: ${normalizedPath}`,
      FileSystemErrorType.UNKNOWN,
      normalizedPath
    );
  }

  // Get combined ignore patterns
  const combinedIgnorePatterns = await getCombinedIgnorePatterns(normalizedPath, ignorePatterns);

  // Start time for processing time calculation
  const startTime = Date.now();

  // Traverse the repository
  const traversalOptions: TraversalOptions = {
    maxFiles,
    ignorePatterns: combinedIgnorePatterns,
  };

  const traversalResult = await traverseDirectory(normalizedPath, traversalOptions);

  // Create file size map
  const fileSizes = new Map<string, number>();
  for (const file of traversalResult.files) {
    try {
      const fileStat = await stat(file);
      fileSizes.set(file, fileStat.size);
    } catch {}
  }

  // Sort files by importance
  const sortedFiles = sortFilesByImportance(traversalResult.files, normalizedPath, fileSizes);

  // Limit to maxFiles if needed
  const filesToProcess = sortedFiles.slice(0, maxFiles);

  // Process files to get language and other information
  const fileInfoPromises = filesToProcess.map(async ({ path: filePath, importance }) => {
    try {
      const fileSize = fileSizes.get(filePath) || 0;
      let content = '';
      let lineCount = 0;

      // Read file content if needed
      if (includeContent || maxLinesPerFile > 0) {
        try {
          content = await readFile(filePath, 'utf8');
          lineCount = content.split('\n').length;

          // Truncate content if needed
          if (maxLinesPerFile > 0 && lineCount > maxLinesPerFile) {
            const lines = content.split('\n').slice(0, maxLinesPerFile);
            content = `${lines.join('\n')}\n... (truncated)`;
          }
        } catch {
          // Skip content reading errors
          lineCount = 0;
          content = '';
        }
      }

      // Detect language
      const language = await detectLanguage(filePath, content);

      // Create file info
      const fileInfo: FileInfo = {
        path: path.relative(normalizedPath, filePath),
        language,
        size: fileSize,
        lineCount,
        importance,
        functions: [], // Will be populated later by code analysis
        classes: [], // Will be populated later by code analysis
      };

      return fileInfo;
    } catch {
      // Skip files with errors
      return null;
    }
  });

  // Wait for all file info promises
  const fileInfoResults = await Promise.all(fileInfoPromises);
  const fileInfos = fileInfoResults.filter(Boolean) as FileInfo[];

  // Extract directory info
  const directoryInfos = extractDirectoryInfo(traversalResult, normalizedPath);

  // Detect repository name
  const repoName = path.basename(normalizedPath);

  // Count languages
  const languageCounts = new Map<string, number>();
  for (const fileInfo of fileInfos) {
    if (fileInfo.language !== 'Unknown') {
      languageCounts.set(fileInfo.language, (languageCounts.get(fileInfo.language) || 0) + 1);
    }
  }

  // Determine primary language
  let primaryLanguage = 'Unknown';
  let maxCount = 0;
  for (const [language, count] of languageCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      primaryLanguage = language;
    }
  }

  // Get languages sorted by count
  const languages = Array.from(languageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([language]) => language);

  // Detect frameworks
  const packageJsonPath = path.join(normalizedPath, 'package.json');
  const frameworks = await detectFrameworks(traversalResult.files, packageJsonPath);

  // Generate file tree if requested
  let tree = '';
  if (includeTree) {
    tree = generateFileTree(normalizedPath, traversalResult.files);
  }

  // Calculate processing time
  const processingTime = Date.now() - startTime;

  // Create repository analysis
  const analysis: RepositoryAnalysis = {
    id: uuidv4(),
    path: normalizedPath,
    name: repoName,
    language: primaryLanguage,
    languages,
    frameworks: frameworks.map((f) => f.name),
    fileCount: traversalResult.files.length,
    directoryCount: traversalResult.directories.length,
    totalSize: traversalResult.totalSize,
    createdAt: new Date(),
    updatedAt: new Date(),

    structure: {
      directories: directoryInfos,
      keyFiles: fileInfos.slice(0, 20), // Top 20 most important files
      tree,
    },

    codeAnalysis: {
      functionCount: 0, // Will be populated later by code analysis
      classCount: 0, // Will be populated later by code analysis
      importCount: 0, // Will be populated later by code analysis
      complexity: {
        cyclomaticComplexity: 0,
        maintainabilityIndex: 0,
        technicalDebt: 'Unknown',
        codeQuality: 'fair',
      },
      patterns: [],
    },

    dependencies: {
      production: [],
      development: [],
      frameworks: frameworks.map((f) => ({
        name: f.name,
        confidence: f.confidence,
      })),
    },

    insights: {
      executiveSummary: '',
      technicalBreakdown: '',
      recommendations: [],
      potentialIssues: [],
    },

    metadata: {
      analysisMode: 'standard',
      processingTime,
    },
  };

  return analysis;
}

/**
 * Generates a simple file tree representation
 *
 * @param basePath - Base path of the repository
 * @param files - List of files
 * @returns String representation of the file tree
 */
export function generateFileTree(basePath: string, files: string[]): string {
  const tree = new Map<string, string[]>();

  // Add root directory
  tree.set('/', []);

  // Process all files
  for (const filePath of files) {
    const relativePath = path.relative(basePath, filePath);
    const parts = relativePath.split(path.sep);

    // Build directory structure
    let currentPath = '/';
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const newPath = path.join(currentPath, part);

      if (!tree.has(newPath)) {
        tree.set(newPath, []);
        tree.get(currentPath)?.push(`${part}/`);
      }

      currentPath = newPath;
    }

    // Add file to its directory
    tree.get(currentPath)?.push(parts[parts.length - 1]);
  }

  // Generate tree string
  let result = '';

  function printTree(dirPath: string, indent = '') {
    const entries = tree.get(dirPath) || [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const isLast = i === entries.length - 1;
      const prefix = isLast ? '└── ' : '├── ';

      result += `${indent}${prefix}${entry}\n`;

      if (entry.endsWith('/')) {
        const newPath = path.join(dirPath, entry.slice(0, -1));
        const newIndent = indent + (isLast ? '    ' : '│   ');
        printTree(newPath, newIndent);
      }
    }
  }

  result += `${path.basename(basePath)}\n`;
  printTree('/');

  return result;
}

/**
 * Converts analysis options to repository discovery options
 *
 * @param options - Analysis options
 * @returns Repository discovery options
 */
export function analysisOptionsToDiscoveryOptions(
  options: AnalysisOptions
): RepositoryDiscoveryOptions {
  const { maxFiles, maxLinesPerFile, includeTree } = options;

  // Adjust max files based on analysis mode
  let adjustedMaxFiles = maxFiles;
  if (options.mode === 'quick') {
    adjustedMaxFiles = Math.min(maxFiles, 200);
  } else if (options.mode === 'comprehensive') {
    adjustedMaxFiles = Math.min(maxFiles, 2000);
  }

  return {
    maxFiles: adjustedMaxFiles,
    maxLinesPerFile,
    includeTree,
  };
}
