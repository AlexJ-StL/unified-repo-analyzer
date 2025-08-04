/**
 * Validate that a path exists and is a directory
 */
export declare function validateRepositoryPath(repoPath: string): string;
/**
 * Ensure output directory exists
 */
export declare function ensureOutputDirectory(outputDir: string): string;
/**
 * Write analysis results to file
 */
export declare function writeResultsToFile(
  outputPath: string,
  data: any,
  format?: 'json' | 'markdown' | 'html'
): string;
