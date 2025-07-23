import path from 'path';
import fs from 'fs';
import { AnalysisOptions, OutputFormat } from '@unified-repo-analyzer/shared';
import {
  ApiClient,
  ProgressTracker,
  validateRepositoryPath,
  writeResultsToFile,
  ensureOutputDirectory,
  handleError,
  config,
} from '../utils';

interface AnalyzeCommandOptions {
  output: OutputFormat;
  mode: 'quick' | 'standard' | 'comprehensive';
  maxFiles?: number;
  maxLines?: number;
  llm?: boolean;
  provider?: string;
  tree?: boolean;
  outputDir?: string;
}

/**
 * Execute the analyze command
 */
export async function executeAnalyze(
  repoPath: string,
  options: AnalyzeCommandOptions
): Promise<void> {
  const progress = new ProgressTracker('Repository Analysis');
  const apiClient = new ApiClient();

  try {
    // Validate repository path
    const absolutePath = validateRepositoryPath(repoPath);
    const repoName = path.basename(absolutePath);

    // Prepare analysis options
    const analysisOptions: Partial<AnalysisOptions> = {
      mode: options.mode,
      outputFormats: [options.output],
      includeTree: options.tree ?? true,
    };

    // Add optional parameters if provided
    if (options.maxFiles) analysisOptions.maxFiles = options.maxFiles;
    if (options.maxLines) analysisOptions.maxLinesPerFile = options.maxLines;
    if (options.llm !== undefined) analysisOptions.includeLLMAnalysis = options.llm;
    if (options.provider) analysisOptions.llmProvider = options.provider;

    // Start analysis
    progress.start(`Analyzing repository ${repoName}`);

    // Call API to analyze repository
    const result = await apiClient.analyzeRepository(absolutePath, analysisOptions);

    // Determine output directory
    const outputDir = options.outputDir || config.get('outputDir');
    const outputDirPath = ensureOutputDirectory(outputDir);

    // Write results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFilename = `${repoName}-analysis-${timestamp}.${options.output}`;
    const outputPath = path.join(outputDirPath, outputFilename);

    writeResultsToFile(outputPath, result, options.output);

    // Complete progress
    progress.succeed(`Analysis complete. Results saved to ${outputPath}`);

    // Print summary
    console.log('\nRepository Analysis Summary:');
    console.log(`- Name: ${result.name}`);
    console.log(`- Primary Language: ${result.language}`);
    console.log(`- File Count: ${result.fileCount}`);
    console.log(`- Directory Count: ${result.directoryCount}`);
    console.log(`- Total Size: ${formatBytes(result.totalSize)}`);
    console.log(`- Processing Time: ${result.metadata.processingTime}ms`);
  } catch (error) {
    progress.fail((error as Error).message);
    handleError(error);
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
