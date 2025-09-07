import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

// Promisify fs functions for easier async/await usage
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

// Define interfaces for our data structures
interface FileMetadata {
  name: string;
  path: string;
  size: number;
  modified: Date;
  isDirectory: boolean;
  type: 'file';
  extension?: string;
  language?: string;
}

interface DirectoryStructure {
  name: string;
  path: string;
  type: 'directory';
  children: (FileMetadata | DirectoryStructure)[];
  modified: Date;
}

interface FileContentMap {
  [filePath: string]: string;
}

interface ComprehensiveReport {
  repositoryPath: string;
  structure: DirectoryStructure;
  fileContents: FileContentMap;
  metadata: {
    totalFiles: number;
    totalDirectories: number;
    totalSize: number;
    analysisDate: Date;
  };
}

/**
 * Analyzes the repository structure and builds a comprehensive tree
 * @param repoPath - The path to the repository to analyze
 * @returns A promise that resolves to the directory structure
 */
export async function analyzeRepositoryStructure(repoPath: string): Promise<DirectoryStructure> {
  try {
    const stats = await stat(repoPath);
    if (!stats.isDirectory()) {
      throw new Error(`Path ${repoPath} is not a directory`);
    }

    const structure = await buildDirectoryStructure(repoPath, path.basename(repoPath));
    return structure;
  } catch (error) {
    throw new Error(
      `Failed to analyze repository structure: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Recursively builds the directory structure
 * @param dirPath - The current directory path
 * @param dirName - The name of the current directory
 * @returns A promise that resolves to the directory structure
 */
async function buildDirectoryStructure(
  dirPath: string,
  dirName: string
): Promise<DirectoryStructure> {
  const stats = await stat(dirPath);

  const directoryStructure: DirectoryStructure = {
    name: dirName,
    path: dirPath,
    type: 'directory',
    children: [],
    modified: stats.mtime,
  };

  try {
    const items = await readdir(dirPath);

    for (const item of items) {
      // Skip hidden files and directories
      if (item.startsWith('.')) {
        continue;
      }

      const itemPath = path.join(dirPath, item);
      const itemStats = await stat(itemPath);

      if (itemStats.isDirectory()) {
        // Recursively process subdirectories
        const subDirectory = await buildDirectoryStructure(itemPath, item);
        directoryStructure.children.push(subDirectory);
      } else {
        // Process files
        const fileMetadata: FileMetadata = {
          name: item,
          path: itemPath,
          size: itemStats.size,
          modified: itemStats.mtime,
          isDirectory: false,
          type: 'file',
          extension: path.extname(item),
          language: detectLanguage(item),
        };
        directoryStructure.children.push(fileMetadata);
      }
    }
  } catch (error) {
    console.warn(
      `Warning: Could not read directory ${dirPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return directoryStructure;
}

/**
 * Detects the programming language based on file extension
 * @param filename - The name of the file
 * @returns The detected language or undefined
 */
function detectLanguage(filename: string): string | undefined {
  const extension = path.extname(filename).toLowerCase();
  const languageMap: { [key: string]: string } = {
    '.js': 'JavaScript',
    '.ts': 'TypeScript',
    '.jsx': 'JavaScript React',
    '.tsx': 'TypeScript React',
    '.py': 'Python',
    '.java': 'Java',
    '.cpp': 'C++',
    '.c': 'C',
    '.cs': 'C#',
    '.go': 'Go',
    '.rs': 'Rust',
    '.php': 'PHP',
    '.rb': 'Ruby',
    '.swift': 'Swift',
    '.kt': 'Kotlin',
    '.scala': 'Scala',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.sass': 'SASS',
    '.less': 'Less',
    '.json': 'JSON',
    '.xml': 'XML',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.md': 'Markdown',
    '.txt': 'Text',
  };

  return languageMap[extension];
}

/**
 * Generates a map of file contents for all files in the repository
 * @param structure - The directory structure to process
 * @param maxFileSize - Maximum file size to read (default: 1MB)
 * @returns A promise that resolves to a map of file paths to their contents
 */
export async function generateFileContentMap(
  structure: DirectoryStructure,
  maxFileSize: number = 1024 * 1024
): Promise<FileContentMap> {
  const contentMap: FileContentMap = {};

  async function processItem(item: FileMetadata | DirectoryStructure): Promise<void> {
    if (item.type === 'directory') {
      // Process directory children
      for (const child of (item as DirectoryStructure).children) {
        await processItem(child);
      }
    } else {
      // Process file
      const fileMetadata = item as FileMetadata;

      // Skip very large files
      if (fileMetadata.size > maxFileSize) {
        contentMap[fileMetadata.path] = `[File too large: ${fileMetadata.size} bytes]`;
        return;
      }

      // Skip binary files based on extension
      const binaryExtensions = [
        '.exe',
        '.dll',
        '.so',
        '.dylib',
        '.bin',
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.pdf',
        '.zip',
        '.tar',
        '.gz',
      ];
      if (
        fileMetadata.extension &&
        binaryExtensions.includes(fileMetadata.extension.toLowerCase())
      ) {
        contentMap[fileMetadata.path] = '[Binary file]';
        return;
      }

      try {
        const content = await readFile(fileMetadata.path, 'utf8');
        contentMap[fileMetadata.path] = content;
      } catch (error) {
        contentMap[fileMetadata.path] =
          `[Error reading file: ${error instanceof Error ? error.message : String(error)}]`;
      }
    }
  }

  // Process all items in the structure
  for (const child of structure.children) {
    await processItem(child);
  }

  return contentMap;
}

/**
 * Creates a comprehensive report combining structure and content
 * @param repoPath - The path to the repository
 * @param structure - The directory structure
 * @param contentMap - The file content map
 * @returns A comprehensive report
 */
export function createComprehensiveReport(
  repoPath: string,
  structure: DirectoryStructure,
  contentMap: FileContentMap
): ComprehensiveReport {
  // Calculate metadata
  let totalFiles = 0;
  let totalDirectories = 0;
  let totalSize = 0;

  function countItems(item: FileMetadata | DirectoryStructure): void {
    if (item.type === 'directory') {
      totalDirectories++;
      const dir = item as DirectoryStructure;
      for (const child of dir.children) {
        countItems(child);
      }
    } else {
      totalFiles++;
      const file = item as FileMetadata;
      totalSize += file.size;
    }
  }

  // Count all items in the structure
  for (const child of structure.children) {
    countItems(child);
  }

  const report: ComprehensiveReport = {
    repositoryPath: repoPath,
    structure,
    fileContents: contentMap,
    metadata: {
      totalFiles,
      totalDirectories,
      totalSize,
      analysisDate: new Date(),
    },
  };

  return report;
}

// Export types for external use
export type { FileMetadata, DirectoryStructure, FileContentMap, ComprehensiveReport };
