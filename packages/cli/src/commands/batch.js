"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeBatch = executeBatch;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("../utils");
/**
 * Execute the batch command
 */
async function executeBatch(basePath, options) {
    const progress = new utils_1.ProgressTracker('Batch Repository Analysis');
    const apiClient = new utils_1.ApiClient();
    try {
        // Validate base path
        const absolutePath = path_1.default.resolve(basePath);
        if (!fs_1.default.existsSync(absolutePath)) {
            throw new Error(`Base path does not exist: ${absolutePath}`);
        }
        // Find repositories in the base path
        progress.start('Discovering repositories');
        const repositories = await discoverRepositories(absolutePath, options.depth || 1, options.filter);
        if (repositories.length === 0) {
            progress.fail('No repositories found in the specified path');
            return;
        }
        progress.succeed(`Found ${repositories.length} repositories`);
        repositories.forEach((repo, index) => {
            console.log(`  ${index + 1}. ${path_1.default.basename(repo)}`);
        });
        // Prepare analysis options
        const analysisOptions = {
            mode: options.mode,
            outputFormats: [options.output],
            includeTree: options.tree ?? true,
        };
        // Add optional parameters if provided
        if (options.maxFiles)
            analysisOptions.maxFiles = options.maxFiles;
        if (options.maxLines)
            analysisOptions.maxLinesPerFile = options.maxLines;
        if (options.llm !== undefined)
            analysisOptions.includeLLMAnalysis = options.llm;
        if (options.provider)
            analysisOptions.llmProvider = options.provider;
        // Start batch analysis
        progress.start(`Analyzing ${repositories.length} repositories`);
        // Call API to analyze repositories in batch
        const result = await apiClient.analyzeBatch(repositories, analysisOptions);
        // Determine output directory
        const outputDir = options.outputDir || utils_1.config.get('outputDir');
        const outputDirPath = (0, utils_1.ensureOutputDirectory)(outputDir);
        // Write individual results to files
        progress.succeed(`Analysis complete. Saving results...`);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        // Save individual repository results
        result.repositories.forEach((repoAnalysis) => {
            const repoName = path_1.default.basename(repoAnalysis.path);
            const outputFilename = `${repoName}-analysis-${timestamp}.${options.output}`;
            const outputPath = path_1.default.join(outputDirPath, outputFilename);
            (0, utils_1.writeResultsToFile)(outputPath, repoAnalysis, options.output);
            console.log(`- Saved ${repoName} analysis to ${outputPath}`);
        });
        // Save combined results if requested
        if (options.combined) {
            const combinedFilename = `batch-analysis-${timestamp}.${options.output}`;
            const combinedPath = path_1.default.join(outputDirPath, combinedFilename);
            (0, utils_1.writeResultsToFile)(combinedPath, result, options.output);
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
            console.log(`- Integration Opportunities: ${result.combinedInsights.integrationOpportunities.length}`);
        }
    }
    catch (error) {
        progress.fail(error.message);
        (0, utils_1.handleError)(error);
    }
}
/**
 * Discover repositories in the given base path
 */
async function discoverRepositories(basePath, depth, filter) {
    const repositories = [];
    // Helper function to check if a directory is a repository
    const isRepository = (dirPath) => {
        // Check for common repository indicators
        return (fs_1.default.existsSync(path_1.default.join(dirPath, '.git')) ||
            fs_1.default.existsSync(path_1.default.join(dirPath, 'package.json')) ||
            fs_1.default.existsSync(path_1.default.join(dirPath, 'requirements.txt')) ||
            fs_1.default.existsSync(path_1.default.join(dirPath, 'pom.xml')) ||
            fs_1.default.existsSync(path_1.default.join(dirPath, 'build.gradle')));
    };
    // Helper function to recursively scan directories
    const scanDirectory = (dirPath, currentDepth) => {
        if (currentDepth > depth)
            return;
        try {
            const entries = fs_1.default.readdirSync(dirPath, { withFileTypes: true });
            // Check if current directory is a repository
            if (isRepository(dirPath)) {
                // Apply filter if provided
                if (!filter || path_1.default.basename(dirPath).includes(filter)) {
                    repositories.push(dirPath);
                }
                // Don't scan deeper if we found a repository
                return;
            }
            // Scan subdirectories
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
                    scanDirectory(path_1.default.join(dirPath, entry.name), currentDepth + 1);
                }
            }
        }
        catch (error) {
            console.warn(`Warning: Could not scan directory ${dirPath}: ${error.message}`);
        }
    };
    // Start scanning from the base path
    scanDirectory(basePath, 1);
    return repositories;
}
//# sourceMappingURL=batch.js.map