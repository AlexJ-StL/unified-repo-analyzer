"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeExport = executeExport;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("../utils");
/**
 * Execute the export command
 */
async function executeExport(analysisId, options) {
    const progress = new utils_1.ProgressTracker('Analysis Export');
    const apiClient = new utils_1.ApiClient();
    try {
        // Start export
        progress.start(`Exporting analysis ${analysisId} in ${options.format} format`);
        // Call API to export analysis
        const exportData = await apiClient.exportAnalysis(analysisId, options.format);
        // Determine output directory
        const outputDir = options.outputDir || utils_1.config.get('outputDir');
        const outputDirPath = (0, utils_1.ensureOutputDirectory)(outputDir);
        // Determine output filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFilename = options.filename || `analysis-${analysisId}-${timestamp}.${options.format}`;
        const outputPath = path_1.default.join(outputDirPath, outputFilename);
        // Write export data to file
        fs_1.default.writeFileSync(outputPath, exportData);
        // Complete progress
        progress.succeed(`Export complete. Results saved to ${outputPath}`);
    }
    catch (error) {
        progress.fail(error.message);
        (0, utils_1.handleError)(error);
    }
}
//# sourceMappingURL=export.js.map