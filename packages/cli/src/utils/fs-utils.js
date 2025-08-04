"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRepositoryPath = validateRepositoryPath;
exports.ensureOutputDirectory = ensureOutputDirectory;
exports.writeResultsToFile = writeResultsToFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const error_handler_1 = require("./error-handler");
/**
 * Validate that a path exists and is a directory
 */
function validateRepositoryPath(repoPath) {
    try {
        // Resolve to absolute path
        const absolutePath = path_1.default.resolve(repoPath);
        // Check if path exists
        if (!fs_1.default.existsSync(absolutePath)) {
            throw new error_handler_1.CLIError(`Repository path does not exist: ${repoPath}`, error_handler_1.ErrorType.FILESYSTEM);
        }
        // Check if path is a directory
        const stats = fs_1.default.statSync(absolutePath);
        if (!stats.isDirectory()) {
            throw new error_handler_1.CLIError(`Path is not a directory: ${repoPath}`, error_handler_1.ErrorType.FILESYSTEM);
        }
        // Check if directory is readable
        try {
            fs_1.default.accessSync(absolutePath, fs_1.default.constants.R_OK);
        }
        catch (_error) {
            throw new error_handler_1.CLIError(`Directory is not readable: ${repoPath}`, error_handler_1.ErrorType.FILESYSTEM);
        }
        return absolutePath;
    }
    catch (error) {
        if (error instanceof error_handler_1.CLIError) {
            throw error;
        }
        throw new error_handler_1.CLIError(`Invalid repository path: ${error.message}`, error_handler_1.ErrorType.FILESYSTEM);
    }
}
/**
 * Ensure output directory exists
 */
function ensureOutputDirectory(outputDir) {
    try {
        const absolutePath = path_1.default.resolve(outputDir);
        if (!fs_1.default.existsSync(absolutePath)) {
            fs_1.default.mkdirSync(absolutePath, { recursive: true });
        }
        return absolutePath;
    }
    catch (error) {
        throw new error_handler_1.CLIError(`Failed to create output directory: ${error.message}`, error_handler_1.ErrorType.FILESYSTEM);
    }
}
/**
 * Write analysis results to file
 */
function writeResultsToFile(outputPath, data, format = 'json') {
    try {
        const dirPath = path_1.default.dirname(outputPath);
        // Ensure directory exists
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
        }
        // Write file based on format
        if (format === 'json') {
            fs_1.default.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        }
        else {
            fs_1.default.writeFileSync(outputPath, data.toString());
        }
        return outputPath;
    }
    catch (error) {
        throw new error_handler_1.CLIError(`Failed to write results to file: ${error.message}`, error_handler_1.ErrorType.FILESYSTEM);
    }
}
//# sourceMappingURL=fs-utils.js.map