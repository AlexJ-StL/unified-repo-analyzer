"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.program = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const commands_1 = require("./commands");
const utils_1 = require("./utils");
// Create CLI program
const program = new commander_1.Command();
exports.program = program;
// Set version and description
program
    .name('repo-analyzer')
    .description('Command-line interface for the Unified Repository Analyzer')
    .version('0.1.0');
// Add analyze command
program
    .command('analyze')
    .description('Analyze a repository')
    .argument('<path>', 'Path to the repository')
    .option('-o, --output <format>', 'Output format (json, markdown, html)', 'json')
    .option('-m, --mode <mode>', 'Analysis mode (quick, standard, comprehensive)', 'standard')
    .option('--max-files <number>', 'Maximum number of files to analyze')
    .option('--max-lines <number>', 'Maximum lines per file to analyze')
    .option('--llm <boolean>', 'Include LLM analysis', (value) => value === 'true')
    .option('--provider <name>', 'LLM provider to use')
    .option('--tree <boolean>', 'Include directory tree in output', (value) => value === 'true')
    .option('--output-dir <path>', 'Directory to save output files')
    .action((path, options) => {
    try {
        (0, commands_1.executeAnalyze)(path, options);
    }
    catch (error) {
        (0, utils_1.handleError)(error);
    }
});
// Add batch command
program
    .command('batch')
    .description('Batch analyze multiple repositories')
    .argument('<path>', 'Base path containing repositories')
    .option('-o, --output <format>', 'Output format (json, markdown, html)', 'json')
    .option('-m, --mode <mode>', 'Analysis mode (quick, standard, comprehensive)', 'standard')
    .option('--max-files <number>', 'Maximum number of files to analyze')
    .option('--max-lines <number>', 'Maximum lines per file to analyze')
    .option('--llm <boolean>', 'Include LLM analysis', (value) => value === 'true')
    .option('--provider <name>', 'LLM provider to use')
    .option('--tree <boolean>', 'Include directory tree in output', (value) => value === 'true')
    .option('--output-dir <path>', 'Directory to save output files')
    .option('--depth <number>', 'Maximum depth to search for repositories', '1')
    .option('--filter <string>', 'Filter repositories by name')
    .option('--combined', 'Generate combined analysis report', false)
    .action((path, options) => {
    try {
        (0, commands_1.executeBatch)(path, options);
    }
    catch (error) {
        (0, utils_1.handleError)(error);
    }
});
// Add search command
program
    .command('search')
    .description('Search indexed repositories')
    .argument('<query>', 'Search query')
    .option('--language <name>', 'Filter by programming language')
    .option('--framework <name>', 'Filter by framework')
    .option('--file-type <ext>', 'Filter by file type')
    .option('--limit <number>', 'Maximum number of results')
    .option('--sort <method>', 'Sort method (relevance, date, size)', 'relevance')
    .option('--json', 'Output results as JSON', false)
    .action((query, options) => {
    try {
        (0, commands_1.executeSearch)(query, options);
    }
    catch (error) {
        (0, utils_1.handleError)(error);
    }
});
// Add export command
program
    .command('export')
    .description('Export analysis results')
    .argument('<analysis-id>', 'ID of the analysis to export')
    .option('-f, --format <format>', 'Export format (json, markdown, html)', 'json')
    .option('--output-dir <path>', 'Directory to save output files')
    .option('--filename <name>', 'Custom filename for the export')
    .action((analysisId, options) => {
    try {
        (0, commands_1.executeExport)(analysisId, options);
    }
    catch (error) {
        (0, utils_1.handleError)(error);
    }
});
// Add index command
program
    .command('index')
    .description('Manage repository index')
    .option('--rebuild', 'Rebuild the entire index')
    .option('--update', 'Update the index with new repositories')
    .option('--path <path>', 'Path to scan for repositories when updating')
    .action((options) => {
    try {
        (0, commands_1.executeIndex)(options);
    }
    catch (error) {
        (0, utils_1.handleError)(error);
    }
});
// Add config command
program
    .command('config')
    .description('Manage configuration')
    .option('--show', 'Show current configuration')
    .option('--set <key=value>', 'Set configuration value')
    .option('--reset', 'Reset configuration to defaults')
    .option('--profile <name>', 'Set active configuration profile')
    .option('--create-profile <name>', 'Create a new configuration profile')
    .action((options) => {
    try {
        if (options.show) {
            console.log(chalk_1.default.blue('Current Configuration:'));
            console.log(JSON.stringify(utils_1.config.store, null, 2));
        }
        else if (options.set) {
            const [key, value] = options.set.split('=');
            if (!key || value === undefined) {
                console.error(chalk_1.default.red('Invalid format. Use --set key=value'));
                return;
            }
            // Handle nested properties
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                const parentObj = utils_1.config.get(parent);
                utils_1.config.set(parent, { ...parentObj, [child]: value });
            }
            else {
                utils_1.config.set(key, value);
            }
            console.log(chalk_1.default.green(`Configuration updated: ${key} = ${value}`));
        }
        else if (options.reset) {
            utils_1.config.clear();
            console.log(chalk_1.default.green('Configuration reset to defaults'));
        }
        else if (options.profile) {
            const profiles = utils_1.config.get('profiles') || {};
            const profileName = options.profile;
            if (!profiles[profileName]) {
                console.error(chalk_1.default.red(`Profile '${profileName}' does not exist`));
                return;
            }
            utils_1.config.set('activeProfile', profileName);
            console.log(chalk_1.default.green(`Activated profile: ${profileName}`));
        }
        else if (options.createProfile) {
            const profileName = options.createProfile;
            const profiles = utils_1.config.get('profiles') || {};
            if (profiles[profileName]) {
                console.error(chalk_1.default.red(`Profile '${profileName}' already exists`));
                return;
            }
            // Create new profile with current settings
            const currentSettings = {
                apiUrl: utils_1.config.get('apiUrl'),
                defaultOptions: utils_1.config.get('defaultOptions'),
                outputDir: utils_1.config.get('outputDir'),
            };
            profiles[profileName] = currentSettings;
            utils_1.config.set('profiles', profiles);
            utils_1.config.set('activeProfile', profileName);
            console.log(chalk_1.default.green(`Created and activated profile: ${profileName}`));
        }
        else {
            console.log(chalk_1.default.yellow('No action specified. Use --show, --set, --reset, --profile, or --create-profile'));
        }
    }
    catch (error) {
        (0, utils_1.handleError)(error);
    }
});
// Add profile command for managing configuration profiles
program
    .command('profile')
    .description('Manage configuration profiles')
    .option('--list', 'List available profiles')
    .option('--show <name>', 'Show profile details')
    .option('--delete <name>', 'Delete a profile')
    .option('--export <name>', 'Export profile to file')
    .option('--import <path>', 'Import profile from file')
    .action((options) => {
    try {
        const profiles = utils_1.config.get('profiles') || {};
        const activeProfile = utils_1.config.get('activeProfile');
        if (options.list) {
            console.log(chalk_1.default.blue('Available Profiles:'));
            Object.keys(profiles).forEach((name) => {
                const marker = name === activeProfile ? '* ' : '  ';
                console.log(`${marker}${name}`);
            });
            if (Object.keys(profiles).length === 0) {
                console.log(chalk_1.default.yellow('No profiles found'));
            }
        }
        else if (options.show) {
            const profileName = options.show;
            if (!profiles[profileName]) {
                console.error(chalk_1.default.red(`Profile '${profileName}' does not exist`));
                return;
            }
            console.log(chalk_1.default.blue(`Profile: ${profileName}`));
            console.log(JSON.stringify(profiles[profileName], null, 2));
        }
        else if (options.delete) {
            const profileName = options.delete;
            if (!profiles[profileName]) {
                console.error(chalk_1.default.red(`Profile '${profileName}' does not exist`));
                return;
            }
            // Remove profile
            const updatedProfiles = { ...profiles };
            delete updatedProfiles[profileName];
            utils_1.config.set('profiles', updatedProfiles);
            // Reset active profile if deleting the active one
            if (activeProfile === profileName) {
                utils_1.config.delete('activeProfile');
            }
            console.log(chalk_1.default.green(`Deleted profile: ${profileName}`));
        }
        else {
            console.log(chalk_1.default.yellow('No action specified. Use --list, --show, --delete, --export, or --import'));
        }
    }
    catch (error) {
        (0, utils_1.handleError)(error);
    }
});
// Only parse if this is the main module (not imported for tests)
if (process.argv[1] && process.argv[1].endsWith('index.js')) {
    program.parse();
}
//# sourceMappingURL=index.js.map