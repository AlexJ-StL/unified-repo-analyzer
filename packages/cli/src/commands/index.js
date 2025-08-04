"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeExport = exports.executeSearch = exports.executeBatch = exports.executeAnalyze = void 0;
exports.executeIndex = executeIndex;
const utils_1 = require("../utils");
/**
 * Execute the index command
 */
async function executeIndex(options) {
    const progress = new utils_1.ProgressTracker('Repository Index');
    const apiClient = new utils_1.ApiClient();
    try {
        if (options.rebuild) {
            // Rebuild the entire index
            progress.start('Rebuilding repository index');
            // Call API to rebuild index
            await apiClient.rebuildIndex();
            progress.succeed('Repository index rebuilt successfully');
        }
        else if (options.update) {
            // Update the index with new repositories
            progress.start('Updating repository index');
            // Call API to update index
            await apiClient.updateIndex(options.path);
            progress.succeed('Repository index updated successfully');
        }
        else {
            // Show index status
            progress.start('Fetching index status');
            // Call API to get index status
            const status = await apiClient.getIndexStatus();
            progress.succeed('Index status retrieved');
            // Display index status
            console.log('\nRepository Index Status:');
            console.log(`- Total Repositories: ${status.totalRepositories}`);
            console.log(`- Last Updated: ${new Date(status.lastUpdated).toLocaleString()}`);
            console.log(`- Languages: ${status.languages.join(', ')}`);
            console.log(`- Frameworks: ${status.frameworks.join(', ')}`);
            console.log(`- Tags: ${status.tags.join(', ')}`);
        }
    }
    catch (error) {
        progress.fail(error.message);
        (0, utils_1.handleError)(error);
    }
}
// Export all commands
var analyze_1 = require("./analyze");
Object.defineProperty(exports, "executeAnalyze", { enumerable: true, get: function () { return analyze_1.executeAnalyze; } });
var batch_1 = require("./batch");
Object.defineProperty(exports, "executeBatch", { enumerable: true, get: function () { return batch_1.executeBatch; } });
var search_1 = require("./search");
Object.defineProperty(exports, "executeSearch", { enumerable: true, get: function () { return search_1.executeSearch; } });
var export_1 = require("./export");
Object.defineProperty(exports, "executeExport", { enumerable: true, get: function () { return export_1.executeExport; } });
//# sourceMappingURL=index.js.map