"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeAnalyze = executeAnalyze;
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils");
/**
 * Execute the analyze command
 */
async function executeAnalyze(repoPath, options) {
    const progress = new utils_1.ProgressTracker('Repository Analysis');
    const apiClient = new utils_1.ApiClient();
    try {
        // Validate repository path
        const absolutePath = (0, utils_1.validateRepositoryPath)(repoPath);
        const repoName = path_1.default.basename(absolutePath);
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
        // Start analysis
        progress.start(`Analyzing repository ${repoName}`);
        // Call API to analyze repository
        const result = await apiClient.analyzeRepository(absolutePath, analysisOptions);
        // Determine output directory
        const outputDir = options.outputDir || utils_1.config.get('outputDir');
        const outputDirPath = (0, utils_1.ensureOutputDirectory)(outputDir);
        // Write results to file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFilename = `${repoName}-analysis-${timestamp}.${options.output}`;
        const outputPath = path_1.default.join(outputDirPath, outputFilename);
        (0, utils_1.writeResultsToFile)(outputPath, result, options.output);
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
    }
    catch (error) {
        progress.fail(error.message);
        (0, utils_1.handleError)(error);
    }
}
/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
//# sourceMappingURL=analyze.js.map