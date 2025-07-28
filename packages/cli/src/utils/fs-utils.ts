import fs from 'fs';
import path from 'path';
import { CLIError, ErrorType } from './error-handler';

/**
 * Validate that a path exists and is a directory
 */
export function validateRepositoryPath(repoPath: string): string {
  try {
    // Resolve to absolute path
    const absolutePath = path.resolve(repoPath);

    // Check if path exists
    if (!fs.existsSync(absolutePath)) {
      throw new CLIError(`Repository path does not exist: ${repoPath}`, ErrorType.FILESYSTEM);
    }

    // Check if path is a directory
    const stats = fs.statSync(absolutePath);
    if (!stats.isDirectory()) {
      throw new CLIError(`Path is not a directory: ${repoPath}`, ErrorType.FILESYSTEM);
    }

    // Check if directory is readable
    try {
      fs.accessSync(absolutePath, fs.constants.R_OK);
    } catch (_error) {
      throw new CLIError(`Directory is not readable: ${repoPath}`, ErrorType.FILESYSTEM);
    }

    return absolutePath;
  } catch (error) {
    if (error instanceof CLIError) {
      throw error;
    }

    throw new CLIError(
      `Invalid repository path: ${(error as Error).message}`,
      ErrorType.FILESYSTEM
    );
  }
}

/**
 * Ensure output directory exists
 */
export function ensureOutputDirectory(outputDir: string): string {
  try {
    const absolutePath = path.resolve(outputDir);

    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true });
    }

    return absolutePath;
  } catch (error) {
    throw new CLIError(
      `Failed to create output directory: ${(error as Error).message}`,
      ErrorType.FILESYSTEM
    );
  }
}

/**
 * Write analysis results to file
 */
export function writeResultsToFile(
  outputPath: string,
  data: any,
  format: 'json' | 'markdown' | 'html' = 'json'
): string {
  try {
    const dirPath = path.dirname(outputPath);

    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write file based on format
    if (format === 'json') {
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    } else {
      fs.writeFileSync(outputPath, data.toString());
    }

    return outputPath;
  } catch (error) {
    throw new CLIError(
      `Failed to write results to file: ${(error as Error).message}`,
      ErrorType.FILESYSTEM
    );
  }
}
