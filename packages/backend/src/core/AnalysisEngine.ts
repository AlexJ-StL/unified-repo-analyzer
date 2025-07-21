/**
 * Core Analysis Engine for repository processing
 */

import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import {
  AnalysisOptions,
  RepositoryAnalysis,
  BatchAnalysisResult,
  OutputFormat,
  TokenUsage,
  SearchQuery,
  SearchResult,
} from '@unified-repo-analyzer/shared/src/types/analysis';
import {
  FileInfo,
  FunctionInfo,
  ClassInfo,
} from '@unified-repo-analyzer/shared/src/types/repository';
import { IndexSystem, RepositoryMatch } from './IndexSystem';
import {
  discoverRepository,
  analysisOptionsToDiscoveryOptions,
} from '../utils/repositoryDiscovery';
import { detectLanguage } from '../utils/languageDetection';
import { readFileWithErrorHandling, FileSystemError } from '../utils/fileSystem';
import { analyzeCodeStructure } from './codeStructureAnalyzer';
import { countTokens, sampleText } from './tokenAnalyzer';

const stat = promisify(fs.stat);

/**
 * Core Analysis Engine for repository processing
 */
export class AnalysisEngine {
  /**
   * Analyzes a single repository
   *
   * @param repoPath - Path to the repository
   * @param options - Analysis options
   * @returns Promise resolving to repository analysis
   */
  public async analyzeRepository(
    repoPath: string,
    options: AnalysisOptions
  ): Promise<RepositoryAnalysis> {
    // Convert analysis options to discovery options
    const discoveryOptions = analysisOptionsToDiscoveryOptions(options);

    // Discover repository structure
    const analysis = await discoverRepository(repoPath, discoveryOptions);

    // Update analysis mode
    analysis.metadata.analysisMode = options.mode;

    // Process files for code structure analysis
    await this.processFilesForAnalysis(analysis, options);

    return analysis;
  }

  /**
   * Analyzes multiple repositories
   *
   * @param repoPaths - Paths to repositories
   * @param options - Analysis options
   * @returns Promise resolving to batch analysis result
   */
  public async analyzeMultipleRepositories(
    repoPaths: string[],
    options: AnalysisOptions
  ): Promise<BatchAnalysisResult> {
    const startTime = Date.now();

    // Analyze each repository
    const analysisPromises = repoPaths.map((repoPath) =>
      this.analyzeRepository(repoPath, options).catch((error) => {
        console.error(`Error analyzing repository ${repoPath}:`, error);
        return null;
      })
    );

    // Wait for all analyses to complete
    const analysisResults = await Promise.all(analysisPromises);

    // Filter out failed analyses
    const repositories = analysisResults.filter(Boolean) as RepositoryAnalysis[];

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Create batch analysis result
    const batchResult: BatchAnalysisResult = {
      id: uuidv4(),
      repositories,
      createdAt: new Date(),
      processingTime,
    };

    return batchResult;
  }

  /**
   * Generates a synopsis of the repository analysis
   *
   * @param analysis - Repository analysis
   * @param format - Output format
   * @returns Promise resolving to synopsis string
   */
  public async generateSynopsis(
    analysis: RepositoryAnalysis,
    format: OutputFormat
  ): Promise<string> {
    // This is a placeholder for future LLM integration
    // For now, we'll just return a simple summary

    switch (format) {
      case 'json':
        return JSON.stringify(analysis, null, 2);

      case 'markdown':
        return this.generateMarkdownSynopsis(analysis);

      case 'html':
        return this.generateHtmlSynopsis(analysis);

      default:
        throw new Error(`Unsupported output format: ${format}`);
    }
  }

  /**
   * Updates the repository index with analysis results
   *
   * @param analysis - Repository analysis
   * @returns Promise resolving when index is updated
   */
  public async updateIndex(analysis: RepositoryAnalysis): Promise<void> {
    // Get the index system instance
    const indexSystem = this.getIndexSystem();

    // Add repository to index
    await indexSystem.addRepository(analysis);

    console.log(`Index updated for repository: ${analysis.name}`);
  }

  /**
   * Gets the index system instance
   *
   * @returns IndexSystem instance
   */
  private getIndexSystem(): any {
    // This is a placeholder that will be replaced with proper dependency injection
    // For now, we'll just import the IndexSystem directly
    const { IndexSystem } = require('./IndexSystem');

    // Create a new instance if needed
    if (!this._indexSystem) {
      this._indexSystem = new IndexSystem();
    }

    return this._indexSystem;
  }

  // Private instance of IndexSystem
  private _indexSystem: any;

  /**
   * Processes files for detailed code analysis
   *
   * @param analysis - Repository analysis
   * @param options - Analysis options
   * @returns Promise resolving when processing is complete
   */
  private async processFilesForAnalysis(
    analysis: RepositoryAnalysis,
    options: AnalysisOptions
  ): Promise<void> {
    // Initialize counters
    let totalFunctionCount = 0;
    let totalClassCount = 0;
    let totalImportCount = 0;
    let totalTokenCount = 0;

    // Process each key file
    const filePromises = analysis.structure.keyFiles.map(async (fileInfo) => {
      try {
        // Get absolute file path
        const filePath = path.join(analysis.path, fileInfo.path);

        // Read file content
        const content = await readFileWithErrorHandling(filePath);

        // Count tokens
        const tokenCount = countTokens(content);
        fileInfo.tokenCount = tokenCount;
        totalTokenCount += tokenCount;

        // Analyze code structure
        const structureAnalysis = analyzeCodeStructure(content, fileInfo.language);

        // Update file info with structure analysis
        fileInfo.functions = structureAnalysis.functions;
        fileInfo.classes = structureAnalysis.classes;

        // Update counters
        totalFunctionCount += structureAnalysis.functions.length;
        totalClassCount += structureAnalysis.classes.length;
        totalImportCount += structureAnalysis.importCount;
      } catch (error) {
        // Skip files with errors
        console.error(`Error processing file ${fileInfo.path}:`, error);
      }
    });

    // Wait for all file processing to complete
    await Promise.all(filePromises);

    // Update analysis with code structure information
    analysis.codeAnalysis.functionCount = totalFunctionCount;
    analysis.codeAnalysis.classCount = totalClassCount;
    analysis.codeAnalysis.importCount = totalImportCount;

    // Add token usage information
    analysis.metadata.tokenUsage = {
      prompt: totalTokenCount,
      completion: 0, // Will be updated when LLM is used
      total: totalTokenCount,
    };
  }

  /**
   * Generates a Markdown synopsis of the repository analysis
   *
   * @param analysis - Repository analysis
   * @returns Markdown formatted synopsis
   */
  private generateMarkdownSynopsis(analysis: RepositoryAnalysis): string {
    return `# ${analysis.name} Repository Analysis

## Overview

- **Language:** ${analysis.language}
- **Languages:** ${analysis.languages.join(', ')}
- **Frameworks:** ${analysis.frameworks.join(', ') || 'None detected'}
- **Files:** ${analysis.fileCount}
- **Directories:** ${analysis.directoryCount}
- **Total Size:** ${(analysis.totalSize / 1024).toFixed(2)} KB

## Code Structure

- **Functions:** ${analysis.codeAnalysis.functionCount}
- **Classes:** ${analysis.codeAnalysis.classCount}
- **Imports:** ${analysis.codeAnalysis.importCount}

## Key Files

${analysis.structure.keyFiles
  .slice(0, 10)
  .map((file) => `- **${file.path}** (${file.language}, ${file.lineCount} lines)`)
  .join('\n')}

## Directory Structure

\`\`\`
${analysis.structure.tree}
\`\`\`

## Analysis Metadata

- **Analysis Mode:** ${analysis.metadata.analysisMode}
- **Processing Time:** ${analysis.metadata.processingTime} ms
- **Token Usage:** ${analysis.metadata.tokenUsage?.total || 'N/A'}
`;
  }

  /**
   * Generates an HTML synopsis of the repository analysis
   *
   * @param analysis - Repository analysis
   * @returns HTML formatted synopsis
   */
  private generateHtmlSynopsis(analysis: RepositoryAnalysis): string {
    // Convert Markdown to HTML
    const markdown = this.generateMarkdownSynopsis(analysis);

    // Simple HTML wrapper
    return `<!DOCTYPE html>
<html>
<head>
  <title>${analysis.name} Repository Analysis</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    h2 { color: #444; margin-top: 20px; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; }
    code { font-family: monospace; }
  </style>
</head>
<body>
  <h1>${analysis.name} Repository Analysis</h1>
  
  <h2>Overview</h2>
  <ul>
    <li><strong>Language:</strong> ${analysis.language}</li>
    <li><strong>Languages:</strong> ${analysis.languages.join(', ')}</li>
    <li><strong>Frameworks:</strong> ${analysis.frameworks.join(', ') || 'None detected'}</li>
    <li><strong>Files:</strong> ${analysis.fileCount}</li>
    <li><strong>Directories:</strong> ${analysis.directoryCount}</li>
    <li><strong>Total Size:</strong> ${(analysis.totalSize / 1024).toFixed(2)} KB</li>
  </ul>
  
  <h2>Code Structure</h2>
  <ul>
    <li><strong>Functions:</strong> ${analysis.codeAnalysis.functionCount}</li>
    <li><strong>Classes:</strong> ${analysis.codeAnalysis.classCount}</li>
    <li><strong>Imports:</strong> ${analysis.codeAnalysis.importCount}</li>
  </ul>
  
  <h2>Key Files</h2>
  <ul>
    ${analysis.structure.keyFiles
      .slice(0, 10)
      .map(
        (file) =>
          `<li><strong>${file.path}</strong> (${file.language}, ${file.lineCount} lines)</li>`
      )
      .join('\n')}
  </ul>
  
  <h2>Directory Structure</h2>
  <pre><code>${analysis.structure.tree}</code></pre>
  
  <h2>Analysis Metadata</h2>
  <ul>
    <li><strong>Analysis Mode:</strong> ${analysis.metadata.analysisMode}</li>
    <li><strong>Processing Time:</strong> ${analysis.metadata.processingTime} ms</li>
    <li><strong>Token Usage:</strong> ${analysis.metadata.tokenUsage?.total || 'N/A'}</li>
  </ul>
</body>
</html>`;
  }

  /**
   * Searches repositories based on query criteria
   *
   * @param query - Search query parameters
   * @returns Promise resolving to search results
   */
  public async searchRepositories(query: SearchQuery): Promise<SearchResult[]> {
    const indexSystem = this.getIndexSystem();
    return indexSystem.searchRepositories(query);
  }

  /**
   * Finds similar repositories to the specified repository
   *
   * @param repoId - Repository ID to find similar repositories for
   * @returns Promise resolving to repository matches
   */
  public async findSimilarRepositories(repoId: string): Promise<RepositoryMatch[]> {
    const indexSystem = this.getIndexSystem();
    return indexSystem.findSimilarRepositories(repoId);
  }

  /**
   * Suggests combinations of repositories that could work well together
   *
   * @param repoIds - Repository IDs to suggest combinations for
   * @returns Promise resolving to combination suggestions
   */
  public async suggestCombinations(repoIds: string[]): Promise<any[]> {
    const indexSystem = this.getIndexSystem();
    return indexSystem.suggestCombinations(repoIds);
  }
}
