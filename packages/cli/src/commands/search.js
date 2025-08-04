"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSearch = executeSearch;
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../utils");
/**
 * Execute the search command
 */
async function executeSearch(query, options) {
    const progress = new utils_1.ProgressTracker('Repository Search');
    const apiClient = new utils_1.ApiClient();
    try {
        // Start search
        progress.start(`Searching repositories for "${query}"`);
        // Build search parameters
        const searchParams = new URLSearchParams();
        searchParams.append('q', query);
        if (options.language)
            searchParams.append('language', options.language);
        if (options.framework)
            searchParams.append('framework', options.framework);
        if (options.fileType)
            searchParams.append('fileType', options.fileType);
        if (options.limit)
            searchParams.append('limit', options.limit.toString());
        if (options.sort)
            searchParams.append('sort', options.sort);
        // Call API to search repositories
        const results = await apiClient.searchRepositories(searchParams.toString());
        // Complete progress
        progress.succeed(`Found ${results.length} repositories matching "${query}"`);
        // Output results
        if (options.json) {
            // Output as JSON
            console.log(JSON.stringify(results, null, 2));
        }
        else {
            // Output as formatted text
            if (results.length === 0) {
                console.log(chalk_1.default.yellow('\nNo repositories found matching your search criteria.'));
                return;
            }
            console.log('\nSearch Results:');
            results.forEach((result, index) => {
                const repo = result.repository;
                console.log(chalk_1.default.bold(`\n${index + 1}. ${repo.name} (Score: ${result.score.toFixed(2)})`));
                console.log(chalk_1.default.gray(`   Path: ${repo.path}`));
                console.log(chalk_1.default.gray(`   Languages: ${repo.languages.join(', ')}`));
                console.log(chalk_1.default.gray(`   Size: ${(0, utils_1.formatBytes)(repo.size)}`));
                console.log(chalk_1.default.gray(`   Last Analyzed: ${(0, utils_1.formatDate)(repo.lastAnalyzed)}`));
                if (repo.tags.length > 0) {
                    console.log(chalk_1.default.gray(`   Tags: ${repo.tags.join(', ')}`));
                }
                console.log(`   ${repo.summary}`);
                if (result.matches.length > 0) {
                    console.log(chalk_1.default.gray('\n   Matches:'));
                    result.matches.slice(0, 3).forEach((match) => {
                        console.log(chalk_1.default.gray(`   - ${match.field}: ${match.value} (Score: ${match.score.toFixed(2)})`));
                    });
                    if (result.matches.length > 3) {
                        console.log(chalk_1.default.gray(`   ... and ${result.matches.length - 3} more matches`));
                    }
                }
            });
        }
    }
    catch (error) {
        progress.fail(error.message);
        (0, utils_1.handleError)(error);
    }
}
//# sourceMappingURL=search.js.map