import path from 'path';
import fs from 'fs';
import { AnalysisOptions, OutputFormat } from '@unified-repo-analyzer/shared';
import {
  ApiClient,
  ProgressTracker,
  writeResultsToFile,
  ensureOutputDirectory,
  handleError,
  config,
} from '../utils';

interface BatchCommandOptions {
  output: OutputFormat;
  mode: 'quick' | 'standard' | 'comprehensive';
  maxFiles?: number;
  maxLines?: number;
  llm?: boolean;
  provider?: string;
  tree?: boolean;
  outputDir?: string;
  depth?: number;
  filter?: string;
  combined?: boolean;
}

/**
 * Execute the batch command
 */
export async function executeBatch(basePath: string, options: BatchCommandOptions): Promise<void> {
  const progress = new ProgressTracker('Batch Repository Analysis');
  const apiClient = new ApiClient();

  try {
    // Validate base path
    const absolutePath = path.resolve(basePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Base path does not exist: ${absolutePath}`);
    }

    // Find repositories in the base path
    progress.start('Discovering repositories');
    const repositories = await discoverRepositories(
      absolutePath,
      options.depth || 1,
      options.filter
    );

    if (repositories.length === 0) {
      progress.fail('No repositories found in the specified path');
      return;
    }

    progress.succeed(`Found ${repositories.length} repositories`);
    repositories.forEach((repo, index) => {
      console.log(`  ${index + 1}. ${path.basename(repo)}`);
    });

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

    // Start batch analysis
    progress.start(`Analyzing ${repositories.length} repositories`);

    // Call API to analyze repositories in batch
    const result = await apiClient.analyzeBatch(repositories, analysisOptions);

    // Determine output directory
    const outputDir = options.outputDir || config.get('outputDir');
    const outputDirPath = ensureOutputDirectory(outputDir);

    // Write individual results to files
    progress.succeed(`Analysis complete. Saving results...`);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Save individual repository results
    result.repositories.forEach((repoAnalysis) => {
      const repoName = path.basename(repoAnalysis.path);
      const outputFilename = `${repoName}-analysis-${timestamp}.${options.output}`;
      const outputPath = path.join(outputDirPath, outputFilename);

      writeResultsToFile(outputPath, repoAnalysis, options.output);
      console.log(`- Saved ${repoName} analysis to ${outputPath}`);
    });

    // Save combined results if requested
    if (options.combined) {
      const combinedFilename = `batch-analysis-${timestamp}.${options.output}`;
      const combinedPath = path.join(outputDirPath, combinedFilename);

      writeResultsToFile(combinedPath, result, options.output);
      console.log(`- Saved combined batch analysis to ${combinedPath}`);
    }

    // Print summary
    console.log('\nBatch Analysis Summary:');
    console.log(`- Total Repositories: ${result.repositories.length}`);
    console.log(`- Successful: ${result.status?.completed || result.repositories.length}`);
    console.log(`- Failed: ${result.status?.failed || 0}`);
    console.log(`- Total Processing Time: ${result.processingTime}ms`);

    if (result.combinedInsights) {
      console.log('\nCombined Insights:');
      console.log(`- Common Technologies: ${result.combinedInsights.commonalities.length}`);
      console.log(
        `- Integration Opportunities: ${result.combinedInsights.integrationOpportunities.length}`
      );
    }
  } catch (error) {
    progress.fail((error as Error).message);
    handleError(error);
  }
}

/**
 * Discover repositories in the given base path
 */
async function discoverRepositories(
  basePath: string,
  depth: number,
  filter?: string
): Promise<string[]> {
  const repositories: string[] = [];

  // Helper function to check if a directory is a repository
  const isRepository = (dirPath: string): boolean => {
    // Check for common repository indicators
    return (
      fs.existsSync(path.join(dirPath, '.git')) ||
      fs.existsSync(path.join(dirPath, 'package.json')) ||
      fs.existsSync(path.join(dirPath, 'requirements.txt')) ||
      fs.existsSync(path.join(dirPath, 'pom.xml')) ||
      fs.existsSync(path.join(dirPath, 'build.gradle'))
    );
  };

  // Helper function to recursively scan directories
  const scanDirectory = (dirPath: string, currentDepth: number) => {
    if (currentDepth > depth) return;

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      // Check if current directory is a repository
      if (isRepository(dirPath)) {
        // Apply filter if provided
        if (!filter || path.basename(dirPath).includes(filter)) {
          repositories.push(dirPath);
        }
        // Don't scan deeper if we found a repository
        return;
      }

      // Scan subdirectories
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
          scanDirectory(path.join(dirPath, entry.name), currentDepth + 1);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${dirPath}: ${(error as Error).message}`);
    }
  };

  // Start scanning from the base path
  scanDirectory(basePath, 1);

  return repositories;
}
