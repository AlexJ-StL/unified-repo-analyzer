import fs from 'node:fs';
import path from 'node:path';
import { pathValidator, SecurityLevel } from '@unified-repo-analyzer/shared';
import { CLIError, ErrorType } from './error-handler';

/**
 * Validate that a path exists and is a directory
 */
export async function validateRepositoryPath(repoPath: string): Promise<string> {
  try {
    console.log('DEBUG: validateRepositoryPath called with:', repoPath);
    console.log('DEBUG: pathValidator available:', typeof pathValidator);
    console.log('DEBUG: SecurityLevel available:', typeof SecurityLevel);

    // Use centralized path validation with strict security
    const validationResult = await pathValidator.quickValidate(repoPath, SecurityLevel.STRICT);

    if (!validationResult.isValid) {
      const primaryError = validationResult.errors[0];
      const errorMessage = primaryError.details
        ? `${primaryError.message}: ${primaryError.details}`
        : primaryError.message;

      throw new CLIError(
        `Repository path validation failed: ${errorMessage}`,
        ErrorType.FILESYSTEM
      );
    }

    // Additional checks for repository-specific requirements
    if (!validationResult.metadata.exists) {
      throw new CLIError(`Repository path does not exist: ${repoPath}`, ErrorType.FILESYSTEM);
    }

    if (!validationResult.metadata.isDirectory) {
      throw new CLIError(`Path is not a directory: ${repoPath}`, ErrorType.FILESYSTEM);
    }

    if (!validationResult.metadata.permissions?.readable) {
      throw new CLIError(`Directory is not readable: ${repoPath}`, ErrorType.FILESYSTEM);
    }

    return validationResult.normalizedPath ?? '';
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
export function writeResultsToFile<T>(
  outputPath: string,
  data: T,
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
      // For markdown and html formats, convert data to string
      const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      fs.writeFileSync(outputPath, content);
    }

    return outputPath;
  } catch (error) {
    throw new CLIError(
      `Failed to write results to file: ${(error as Error).message}`,
      ErrorType.FILESYSTEM
    );
  }
}
