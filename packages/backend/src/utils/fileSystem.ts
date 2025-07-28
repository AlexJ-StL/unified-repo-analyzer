/**
 * File system utilities for repository discovery and traversal
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import ignore from 'ignore';
import { DirectoryInfo } from '@unified-repo-analyzer/shared/src/types/repository';

// Promisify fs functions
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

/**
 * Options for directory traversal
 */
export interface TraversalOptions {
  /**
   * Maximum depth to traverse (0 = unlimited)
   */
  maxDepth?: number;

  /**
   * Maximum number of files to process
   */
  maxFiles?: number;

  /**
   * Ignore patterns (gitignore format)
   */
  ignorePatterns?: string[];

  /**
   * Custom function to determine if a file should be included
   */
  fileFilter?: (filePath: string) => boolean;
}

/**
 * Result of directory traversal
 */
export interface TraversalResult {
  /**
   * List of discovered files
   */
  files: string[];

  /**
   * List of discovered directories
   */
  directories: string[];

  /**
   * Total size of all files in bytes
   */
  totalSize: number;

  /**
   * Files that were skipped due to errors
   */
  skippedFiles: { path: string; error: string }[];
}

/**
 * Error types for file system operations
 */
export enum FileSystemErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_PATH = 'INVALID_PATH',
  READ_ERROR = 'READ_ERROR',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom error class for file system operations
 */
export class FileSystemError extends Error {
  type: FileSystemErrorType;
  path: string;

  constructor(message: string, type: FileSystemErrorType, filePath: string) {
    super(message);
    this.name = 'FileSystemError';
    this.type = type;
    this.path = filePath;
  }
}

/**
 * Traverses a directory recursively with configurable options
 *
 * @param dirPath - Path to the directory to traverse
 * @param options - Traversal options
 * @returns Promise resolving to traversal result
 */
export async function traverseDirectory(
  dirPath: string,
  options: TraversalOptions = {}
): Promise<TraversalResult> {
  const { maxDepth = 0, maxFiles = 0, ignorePatterns = [], fileFilter = () => true } = options;

  // Normalize and resolve the directory path
  const normalizedPath = path.resolve(dirPath);

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
        `Directory not found: ${normalizedPath}`,
        FileSystemErrorType.NOT_FOUND,
        normalizedPath
      );
    } else if ((error as NodeJS.ErrnoException).code === 'EACCES') {
      throw new FileSystemError(
        `Permission denied: ${normalizedPath}`,
        FileSystemErrorType.PERMISSION_DENIED,
        normalizedPath
      );
    } else {
      throw new FileSystemError(
        `Error accessing directory: ${normalizedPath}`,
        FileSystemErrorType.UNKNOWN,
        normalizedPath
      );
    }
  }

  // Set up ignore filter if ignore patterns are provided
  const ignoreFilter = ignorePatterns.length > 0 ? ignore().add(ignorePatterns) : null;

  // Initialize result
  const result: TraversalResult = {
    files: [],
    directories: [],
    totalSize: 0,
    skippedFiles: [],
  };

  // Internal recursive traversal function
  async function traverse(
    currentPath: string,
    currentDepth: number,
    relativePath: string = ''
  ): Promise<void> {
    // Check if we've reached the maximum number of files
    if (maxFiles > 0 && result.files.length >= maxFiles) {
      return;
    }

    // Check if we've reached the maximum depth
    if (maxDepth > 0 && currentDepth > maxDepth) {
      return;
    }

    try {
      const entries = await readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry.name);
        const entryRelativePath = path.join(relativePath, entry.name);

        // Skip if the path matches ignore patterns
        if (ignoreFilter && ignoreFilter.ignores(entryRelativePath)) {
          continue;
        }

        try {
          if (entry.isDirectory()) {
            // Add directory to result
            result.directories.push(entryPath);

            // Recursively traverse subdirectory
            await traverse(entryPath, currentDepth + 1, entryRelativePath);
          } else if (entry.isFile()) {
            // Check custom file filter
            if (!fileFilter(entryPath)) {
              continue;
            }

            // Add file to result
            result.files.push(entryPath);

            // Get file size
            const fileStat = await stat(entryPath);
            result.totalSize += fileStat.size;
          }
        } catch (error) {
          let errorMessage = 'Unknown error';
          if (error instanceof Error) {
            errorMessage = error.message;
          }

          result.skippedFiles.push({
            path: entryPath,
            error: errorMessage,
          });
        }
      }
    } catch (error) {
      let errorMessage = 'Unknown error';
      let errorType = FileSystemErrorType.UNKNOWN;

      if (error instanceof Error) {
        errorMessage = error.message;

        if ((error as NodeJS.ErrnoException).code === 'EACCES') {
          errorType = FileSystemErrorType.PERMISSION_DENIED;
        } else if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          errorType = FileSystemErrorType.NOT_FOUND;
        }
      }

      throw new FileSystemError(
        `Error reading directory ${currentPath}: ${errorMessage}`,
        errorType,
        currentPath
      );
    }
  }

  // Start traversal from the root directory
  await traverse(normalizedPath, 1);

  return result;
}

/**
 * Reads a file with error handling
 *
 * @param filePath - Path to the file
 * @param encoding - File encoding (default: 'utf8')
 * @returns Promise resolving to file content
 */
export async function readFileWithErrorHandling(
  filePath: string,
  encoding: BufferEncoding = 'utf8'
): Promise<string> {
  try {
    return await readFile(filePath, { encoding });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new FileSystemError(
        `File not found: ${filePath}`,
        FileSystemErrorType.NOT_FOUND,
        filePath
      );
    } else if ((error as NodeJS.ErrnoException).code === 'EACCES') {
      throw new FileSystemError(
        `Permission denied: ${filePath}`,
        FileSystemErrorType.PERMISSION_DENIED,
        filePath
      );
    } else {
      throw new FileSystemError(
        `Error reading file: ${filePath}`,
        FileSystemErrorType.READ_ERROR,
        filePath
      );
    }
  }
}

/**
 * Gets common ignore patterns for repository analysis
 *
 * @returns Array of common ignore patterns
 */
export function getCommonIgnorePatterns(): string[] {
  return [
    // Version control
    '.git/**',
    '.svn/**',
    '.hg/**',

    // Build artifacts
    'node_modules/**',
    'dist/**',
    'build/**',
    'out/**',
    'target/**',
    'bin/**',
    'obj/**',

    // Package manager files
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',

    // Logs
    '*.log',
    'logs/**',

    // Cache
    '.cache/**',
    '.npm/**',

    // IDE files
    '.idea/**',
    '.vscode/**',
    '*.iml',

    // Test coverage
    'coverage/**',
    '.nyc_output/**',

    // Temporary files
    'tmp/**',
    'temp/**',
    '*.tmp',

    // OS files
    '.DS_Store',
    'Thumbs.db',

    // Large media files
    '*.mp4',
    '*.mov',
    '*.avi',
    '*.wmv',
    '*.flv',
    '*.mp3',
    '*.wav',
    '*.flac',

    // Archives
    '*.zip',
    '*.tar',
    '*.gz',
    '*.rar',
    '*.7z',

    // Images (optional, can be commented out if needed)
    // '*.jpg',
    // '*.jpeg',
    // '*.png',
    // '*.gif',
    // '*.svg',

    // Documentation (optional, can be commented out if needed)
    // '*.pdf',
    // '*.doc',
    // '*.docx',
    // '*.ppt',
    // '*.pptx',
    // '*.xls',
    // '*.xlsx',
  ];
}

/**
 * Reads and parses .gitignore file if it exists
 *
 * @param repoPath - Path to the repository
 * @returns Promise resolving to array of ignore patterns
 */
export async function readGitignore(repoPath: string): Promise<string[]> {
  const gitignorePath = path.join(repoPath, '.gitignore');

  try {
    const content = await readFile(gitignorePath, 'utf8');
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
  } catch (error) {
    // If .gitignore doesn't exist, return empty array
    return [];
  }
}

/**
 * Combines custom ignore patterns with .gitignore patterns
 *
 * @param repoPath - Path to the repository
 * @param customPatterns - Custom ignore patterns
 * @returns Promise resolving to combined ignore patterns
 */
export async function getCombinedIgnorePatterns(
  repoPath: string,
  customPatterns: string[] = []
): Promise<string[]> {
  const gitignorePatterns = await readGitignore(repoPath);
  const commonPatterns = getCommonIgnorePatterns();

  return [...new Set([...gitignorePatterns, ...commonPatterns, ...customPatterns])];
}

/**
 * Extracts directory information for repository analysis
 *
 * @param traversalResult - Result of directory traversal
 * @param basePath - Base path of the repository
 * @returns Array of directory information
 */
export function extractDirectoryInfo(
  traversalResult: TraversalResult,
  basePath: string
): DirectoryInfo[] {
  const dirMap = new Map<string, DirectoryInfo>();

  // Initialize with root directory
  dirMap.set(basePath, {
    path: '/',
    files: 0,
    subdirectories: 0,
  });

  // Process all directories
  for (const dirPath of traversalResult.directories) {
    const relativePath = path.relative(basePath, dirPath);
    if (!relativePath) continue; // Skip root directory

    const parentPath = path.dirname(dirPath);

    // Add directory to map
    dirMap.set(dirPath, {
      path: relativePath,
      files: 0,
      subdirectories: 0,
    });

    // Update parent directory
    const parentDir = dirMap.get(parentPath);
    if (parentDir) {
      parentDir.subdirectories += 1;
    }
  }

  // Count files in each directory
  for (const filePath of traversalResult.files) {
    const dirPath = path.dirname(filePath);
    const dir = dirMap.get(dirPath);
    if (dir) {
      dir.files += 1;
    }
  }

  // Convert map to array
  return Array.from(dirMap.values());
}
