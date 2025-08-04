/**
 * Core Analysis Engine for repository processing
 */

import path from "node:path";
import type {
	AnalysisOptions,
	BatchAnalysisResult,
	OutputFormat,
	RepositoryAnalysis,
	SearchQuery,
	SearchResult,
} from "@unified-repo-analyzer/shared/src/types/analysis";
import { v4 as uuidv4 } from "uuid";
import { cacheService } from "../services/cache.service";
import { deduplicationService } from "../services/deduplication.service";
import { metricsService } from "../services/metrics.service";
import { readFileWithErrorHandling } from "../utils/fileSystem";
import {
	analysisOptionsToDiscoveryOptions,
	discoverRepository,
} from "../utils/repositoryDiscovery";
import { AdvancedAnalyzer } from "./advancedAnalyzer";
import { analyzeCodeStructure } from "./codeStructureAnalyzer";
import type { RepositoryMatch } from "./IndexSystem";
import { countTokens } from "./tokenAnalyzer";

/**
 * Core Analysis Engine for repository processing
 */
export class AnalysisEngine {
	private advancedAnalyzer: AdvancedAnalyzer;

	constructor() {
		this.advancedAnalyzer = new AdvancedAnalyzer();
	}
	/**
	 * Analyzes a single repository
	 *
	 * @param repoPath - Path to the repository
	 * @param options - Analysis options
	 * @returns Promise resolving to repository analysis
	 */
	public async analyzeRepository(
		repoPath: string,
		options: AnalysisOptions,
	): Promise<RepositoryAnalysis> {
		const timer = metricsService.createTimer("analysis.duration", {
			mode: options.mode,
		});

		return deduplicationService.deduplicateAnalysis(
			repoPath,
			options,
			async () => {
				// Check cache first
				const cached = await cacheService.getCachedAnalysis(repoPath, options);
				if (cached) {
					timer.end();
					metricsService.recordAnalysis(
						repoPath,
						options.mode,
						0, // No processing time for cached results
						cached.fileCount,
						cached.totalSize,
						true, // Cache hit
						false, // Not deduplicated (this is the original request)
					);
					return cached;
				}

				const startTime = Date.now();

				// Convert analysis options to discovery options
				const discoveryOptions = analysisOptionsToDiscoveryOptions(options);

				// Discover repository structure
				const analysis = await discoverRepository(repoPath, discoveryOptions);

				// Update analysis mode
				analysis.metadata.analysisMode = options.mode;

				// Process files for code structure analysis
				await this.processFilesForAnalysis(analysis, options);

				// Perform advanced analysis if in comprehensive mode
				if (options.mode === "comprehensive") {
					const advancedResults =
						await this.advancedAnalyzer.analyzeRepository(analysis);

					// Update analysis with advanced results
					analysis.codeAnalysis.complexity =
						advancedResults.codeQuality.overallScore > 0
							? analysis.codeAnalysis.complexity
							: analysis.codeAnalysis.complexity;

					// Store advanced results in insights
					analysis.insights.recommendations.push(
						...advancedResults.security.recommendations,
					);
					analysis.insights.recommendations.push(
						...advancedResults.architecture.recommendations,
					);

					// Add security and quality information to potential issues
					const securityIssues = advancedResults.security.vulnerabilities
						.filter((v) => v.severity === "high" || v.severity === "critical")
						.map((v) => `Security: ${v.description}`);
					analysis.insights.potentialIssues.push(...securityIssues);

					const qualityIssues = advancedResults.codeQuality.technicalDebt
						.filter((d) => d.severity === "high")
						.map((d) => `Quality: ${d.description}`);
					analysis.insights.potentialIssues.push(...qualityIssues);
				}

				const processingTime = Date.now() - startTime;
				analysis.metadata.processingTime = processingTime;

				// Cache the result
				await cacheService.setCachedAnalysis(repoPath, options, analysis);

				timer.end();
				metricsService.recordAnalysis(
					repoPath,
					options.mode,
					processingTime,
					analysis.fileCount,
					analysis.totalSize,
					false, // Not a cache hit
					false, // Not deduplicated (this is the original request)
				);

				return analysis;
			},
		);
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
		options: AnalysisOptions,
	): Promise<BatchAnalysisResult> {
		const startTime = Date.now();
		const batchId = uuidv4();

		// Create batch analysis result
		const batchResult: BatchAnalysisResult = {
			id: batchId,
			repositories: [],
			createdAt: new Date(),
			processingTime: 0,
			status: {
				total: repoPaths.length,
				completed: 0,
				failed: 0,
				inProgress: 0,
				pending: repoPaths.length,
				progress: 0,
			},
		};

		// Process repositories sequentially to avoid overwhelming the system
		for (let i = 0; i < repoPaths.length; i++) {
			const repoPath = repoPaths[i];

			// Update status
			batchResult.status.pending--;
			batchResult.status.inProgress++;
			batchResult.status.progress = Math.round(
				((batchResult.status.completed + batchResult.status.failed) /
					batchResult.status.total) *
					100,
			);

			try {
				// Analyze repository
				const analysis = await this.analyzeRepository(repoPath, options);

				// Add to results
				batchResult.repositories.push(analysis);

				// Update status
				batchResult.status.completed++;
				batchResult.status.inProgress--;
			} catch (_error) {
				// Update status
				batchResult.status.failed++;
				batchResult.status.inProgress--;
			}

			// Update progress
			batchResult.status.progress = Math.round(
				((batchResult.status.completed + batchResult.status.failed) /
					batchResult.status.total) *
					100,
			);
		}

		// Generate combined insights if multiple repositories were analyzed successfully
		if (batchResult.repositories.length > 1) {
			batchResult.combinedInsights = await this.generateCombinedInsights(
				batchResult.repositories,
			);
		}

		// Calculate processing time
		batchResult.processingTime = Date.now() - startTime;

		return batchResult;
	}

	/**
	 * Analyzes multiple repositories using a queue system for concurrency control
	 *
	 * @param repoPaths - Paths to repositories
	 * @param options - Analysis options
	 * @param concurrency - Maximum number of concurrent analyses
	 * @param progressCallback - Callback for progress updates
	 * @returns Promise resolving to batch analysis result
	 */
	public async analyzeMultipleRepositoriesWithQueue(
		repoPaths: string[],
		options: AnalysisOptions,
		concurrency = 2,
		progressCallback?: (progress: any) => void,
	): Promise<BatchAnalysisResult> {
		const timer = metricsService.createTimer("batch.analysis.duration", {
			mode: options.mode,
			repositoryCount: repoPaths.length.toString(),
		});

		return deduplicationService.deduplicateBatch(
			repoPaths,
			options,
			async () => {
				// Check cache first
				const cached = await cacheService.getCachedBatchAnalysis(
					repoPaths,
					options,
				);
				if (cached) {
					timer.end();
					return cached;
				}

				const startTime = Date.now();
				const batchId = uuidv4();

				// Import TaskQueue
				const { TaskQueue, QueueEvent } = await import("../utils/queue");

				// Create queue for processing repositories
				const queue = new TaskQueue(
					async (repoPath: string) => this.analyzeRepository(repoPath, options),
					{ concurrency },
				);

				// Create batch analysis result
				const batchResult: BatchAnalysisResult = {
					id: batchId,
					repositories: [],
					createdAt: new Date(),
					processingTime: 0,
					status: {
						total: repoPaths.length,
						completed: 0,
						failed: 0,
						inProgress: 0,
						pending: repoPaths.length,
						progress: 0,
					},
				};

				// Set up progress tracking
				queue.on(QueueEvent.QUEUE_PROGRESS, (progress) => {
					// Update batch status
					batchResult.status = {
						total: progress.total,
						completed: progress.completed,
						failed: progress.failed,
						inProgress: progress.running,
						pending: progress.pending,
						progress: progress.progress,
					};

					// Call progress callback if provided
					if (progressCallback) {
						progressCallback({
							batchId,
							status: batchResult.status,
							currentRepository: Array.from(queue.getAllTasks())
								.filter((task) => task.status === "running")
								.map((task) => task.data),
						});
					}
				});

				// Set up completion handlers
				queue.on(QueueEvent.TASK_COMPLETED, (task) => {
					if (task.result) {
						batchResult.repositories.push(task.result);
					}
				});

				// Add all repositories to the queue
				for (const repoPath of repoPaths) {
					queue.addTask(uuidv4(), repoPath);
				}

				// Wait for all tasks to complete
				await new Promise<void>((resolve) => {
					queue.on(QueueEvent.QUEUE_DRAINED, resolve);
				});

				// Generate combined insights if multiple repositories were analyzed successfully
				if (batchResult.repositories.length > 1) {
					batchResult.combinedInsights = await this.generateCombinedInsights(
						batchResult.repositories,
					);
				}

				// Calculate processing time
				batchResult.processingTime = Date.now() - startTime;

				// Cache the result
				await cacheService.setCachedBatchAnalysis(
					repoPaths,
					options,
					batchResult,
				);

				timer.end();
				return batchResult;
			},
		);
	}

	/**
	 * Generates combined insights for multiple repositories
	 *
	 * @param repositories - Repository analyses
	 * @returns Combined insights
	 */
	private async generateCombinedInsights(
		repositories: RepositoryAnalysis[],
	): Promise<{
		commonalities: string[];
		differences: string[];
		integrationOpportunities: string[];
	}> {
		// Find common languages
		const languageSets = repositories.map((repo) => new Set(repo.languages));
		const commonLanguages = Array.from(
			languageSets.reduce((common, languages) => {
				return new Set([...common].filter((lang) => languages.has(lang)));
			}, languageSets[0] || new Set()),
		);

		// Find common frameworks
		const frameworkSets = repositories.map((repo) => new Set(repo.frameworks));
		const commonFrameworks = Array.from(
			frameworkSets.reduce((common, frameworks) => {
				return new Set(
					[...common].filter((framework) => frameworks.has(framework)),
				);
			}, frameworkSets[0] || new Set()),
		);

		// Find unique languages per repository
		const uniqueLanguages = repositories.map((repo) => {
			return {
				name: repo.name,
				languages: repo.languages.filter(
					(lang) => !commonLanguages.includes(lang),
				),
			};
		});

		// Find unique frameworks per repository
		const uniqueFrameworks = repositories.map((repo) => {
			return {
				name: repo.name,
				frameworks: repo.frameworks.filter(
					(framework) => !commonFrameworks.includes(framework),
				),
			};
		});

		// Generate commonalities
		const commonalities: string[] = [
			commonLanguages.length > 0
				? `All repositories use the following languages: ${commonLanguages.join(", ")}`
				: "No common languages found across all repositories",
			commonFrameworks.length > 0
				? `All repositories use the following frameworks: ${commonFrameworks.join(", ")}`
				: "No common frameworks found across all repositories",
		];

		// Generate differences
		const differences: string[] = [];
		uniqueLanguages.forEach((repo) => {
			if (repo.languages.length > 0) {
				differences.push(
					`${repo.name} uniquely uses: ${repo.languages.join(", ")}`,
				);
			}
		});
		uniqueFrameworks.forEach((repo) => {
			if (repo.frameworks.length > 0) {
				differences.push(
					`${repo.name} uniquely uses frameworks: ${repo.frameworks.join(", ")}`,
				);
			}
		});

		// Generate integration opportunities
		const integrationOpportunities: string[] = [];

		// Check for complementary technologies
		if (commonLanguages.length > 0 || commonFrameworks.length > 0) {
			integrationOpportunities.push(
				"Repositories share common technologies which could facilitate integration",
			);
		}

		// Check for frontend/backend pairs
		const hasFrontend = repositories.some((repo) =>
			repo.frameworks.some((f) =>
				["react", "vue", "angular", "svelte"].includes(f.toLowerCase()),
			),
		);
		const hasBackend = repositories.some((repo) =>
			repo.frameworks.some((f) =>
				["express", "nest", "django", "flask", "spring"].includes(
					f.toLowerCase(),
				),
			),
		);

		if (hasFrontend && hasBackend) {
			integrationOpportunities.push(
				"Potential for frontend-backend integration detected",
			);
		}

		return {
			commonalities,
			differences,
			integrationOpportunities,
		};
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
		format: OutputFormat,
	): Promise<string> {
		// Import export service
		const { default: exportService } = await import(
			"../services/export.service"
		);

		// Use export service to generate content
		return exportService.exportAnalysis(analysis, format);
	}

	/**
	 * Updates the repository index with analysis results
	 *
	 * @param analysis - Repository analysis
	 * @returns Promise resolving when index is updated
	 */
	public async updateIndex(analysis: RepositoryAnalysis): Promise<void> {
		// Get the index system instance
		const indexSystem = await this.getIndexSystem();

		// Add repository to index
		await indexSystem.addRepository(analysis);

		console.log(`Index updated for repository: ${analysis.name}`);
	}

	/**
	 * Gets the index system instance
	 *
	 * @returns IndexSystem instance
	 */
	private async getIndexSystem(): Promise<any> {
		// This is a placeholder that will be replaced with proper dependency injection
		// For now, we'll just import the IndexSystem directly
		const { IndexSystem } = await import("./IndexSystem");

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
		_options: AnalysisOptions,
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
				const structureAnalysis = analyzeCodeStructure(
					content,
					fileInfo.language,
				);

				// Update file info with structure analysis
				fileInfo.functions = structureAnalysis.functions;
				fileInfo.classes = structureAnalysis.classes;

				// Update counters
				totalFunctionCount += structureAnalysis.functions.length;
				totalClassCount += structureAnalysis.classes.length;
				totalImportCount += structureAnalysis.importCount;
			} catch (_error) {}
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

	// Export functionality has been moved to the export service

	/**
	 * Searches repositories based on query criteria
	 *
	 * @param query - Search query parameters
	 * @returns Promise resolving to search results
	 */
	public async searchRepositories(query: SearchQuery): Promise<SearchResult[]> {
		const indexSystem = await this.getIndexSystem();
		return indexSystem.searchRepositories(query);
	}

	/**
	 * Finds similar repositories to the specified repository
	 *
	 * @param repoId - Repository ID to find similar repositories for
	 * @returns Promise resolving to repository matches
	 */
	public async findSimilarRepositories(
		repoId: string,
	): Promise<RepositoryMatch[]> {
		const indexSystem = await this.getIndexSystem();
		return indexSystem.findSimilarRepositories(repoId);
	}

	/**
	 * Suggests combinations of repositories that could work well together
	 *
	 * @param repoIds - Repository IDs to suggest combinations for
	 * @returns Promise resolving to combination suggestions
	 */
	public async suggestCombinations(repoIds: string[]): Promise<any[]> {
		const indexSystem = await this.getIndexSystem();
		return indexSystem.suggestCombinations(repoIds);
	}
}
