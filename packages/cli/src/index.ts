import { Command } from 'commander';
import chalk from 'chalk';
import { executeAnalyze } from './commands';
import { handleError, config } from './utils';

// Create CLI program
const program = new Command();

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
      executeAnalyze(path, options);
    } catch (error) {
      handleError(error);
    }
  });

// Add batch command
program
  .command('batch')
  .description('Batch analyze multiple repositories')
  .argument('<path>', 'Base path containing repositories')
  .option('-o, --output <format>', 'Output format (json, markdown, html)', 'json')
  .option('-m, --mode <mode>', 'Analysis mode (quick, standard, comprehensive)', 'standard')
  .action((path, options) => {
    console.log(chalk.blue(`Batch analyzing repositories in ${path}`));
    console.log(chalk.gray(`Output format: ${options.output}`));
    console.log(chalk.gray(`Analysis mode: ${options.mode}`));
    console.log(chalk.yellow('This feature will be implemented in a future update.'));
  });

// Add search command
program
  .command('search')
  .description('Search indexed repositories')
  .argument('<query>', 'Search query')
  .action((query) => {
    console.log(chalk.blue(`Searching repositories for "${query}"`));
    console.log(chalk.yellow('This feature will be implemented in a future update.'));
  });

// Add config command
program
  .command('config')
  .description('Manage configuration')
  .option('--show', 'Show current configuration')
  .option('--set <key=value>', 'Set configuration value')
  .option('--reset', 'Reset configuration to defaults')
  .action((options) => {
    try {
      if (options.show) {
        console.log(chalk.blue('Current Configuration:'));
        console.log(JSON.stringify(config.store, null, 2));
      } else if (options.set) {
        const [key, value] = options.set.split('=');
        if (!key || value === undefined) {
          console.error(chalk.red('Invalid format. Use --set key=value'));
          return;
        }

        // Handle nested properties
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          const parentObj = config.get(parent) as Record<string, any>;
          config.set(parent, { ...parentObj, [child]: value });
        } else {
          config.set(key, value);
        }

        console.log(chalk.green(`Configuration updated: ${key} = ${value}`));
      } else if (options.reset) {
        config.clear();
        console.log(chalk.green('Configuration reset to defaults'));
      } else {
        console.log(chalk.yellow('No action specified. Use --show, --set, or --reset'));
      }
    } catch (error) {
      handleError(error);
    }
  });

// Only parse if this is the main module (not imported for tests)
if (require.main === module) {
  program.parse();
}

// Export program for testing
export { program };
