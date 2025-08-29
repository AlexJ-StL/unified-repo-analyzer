import chalk from "chalk";
import { Command } from "commander";

import { config, handleError } from "./utils";
import {
  executeAnalyze,
  executeBatch,
  executeExport,
  executeIndex,
  executeSearch,
} from "./commands";
// Create CLI program
const program = new Command();

// Set version and description
program
  .name("repo-analyzer")
  .description("Command-line interface for the Unified Repository Analyzer")
  .version("0.1.0");

// Add analyze command
program
  .command("analyze")
  .description("Analyze a repository")
  .argument("<path>", "Path to the repository")
  .option(
    "-o, --output <format>",
    "Output format (json, markdown, html)",
    "json"
  )
  .option(
    "-m, --mode <mode>",
    "Analysis mode (quick, standard, comprehensive)",
    "standard"
  )
  .option("--max-files <number>", "Maximum number of files to analyze")
  .option("--max-lines <number>", "Maximum lines per file to analyze")
  .option(
    "--llm <boolean>",
    "Include LLM analysis",
    (value) => value === "true"
  )
  .option("--provider <name>", "LLM provider to use")
  .option(
    "--tree <boolean>",
    "Include directory tree in output",
    (value) => value === "true"
  )
  .option("--output-dir <path>", "Directory to save output files")
  .action(async (path, options) => {
    try {
      await executeAnalyze(path, options);
    } catch (error) {
      handleError(error);
    }
  });

// Add batch command
program
  .command("batch")
  .description("Batch analyze multiple repositories")
  .argument("<path>", "Base path containing repositories")
  .option(
    "-o, --output <format>",
    "Output format (json, markdown, html)",
    "json"
  )
  .option(
    "-m, --mode <mode>",
    "Analysis mode (quick, standard, comprehensive)",
    "standard"
  )
  .option("--max-files <number>", "Maximum number of files to analyze")
  .option("--max-lines <number>", "Maximum lines per file to analyze")
  .option(
    "--llm <boolean>",
    "Include LLM analysis",
    (value) => value === "true"
  )
  .option("--provider <name>", "LLM provider to use")
  .option(
    "--tree <boolean>",
    "Include directory tree in output",
    (value) => value === "true"
  )
  .option("--output-dir <path>", "Directory to save output files")
  .option("--depth <number>", "Maximum depth to search for repositories", "1")
  .option("--filter <string>", "Filter repositories by name")
  .option("--combined", "Generate combined analysis report", false)
  .action((path, options) => {
    try {
      executeBatch(path, options);
    } catch (error) {
      handleError(error);
    }
  });

// Add search command
program
  .command("search")
  .description("Search indexed repositories")
  .argument("<query>", "Search query")
  .option("--language <name>", "Filter by programming language")
  .option("--framework <name>", "Filter by framework")
  .option("--file-type <ext>", "Filter by file type")
  .option("--limit <number>", "Maximum number of results")
  .option("--sort <method>", "Sort method (relevance, date, size)", "relevance")
  .option("--json", "Output results as JSON", false)
  .action((query, options) => {
    try {
      executeSearch(query, options);
    } catch (error) {
      handleError(error);
    }
  });

// Add export command
program
  .command("export")
  .description("Export analysis results")
  .argument("<analysis-id>", "ID of the analysis to export")
  .option(
    "-f, --format <format>",
    "Export format (json, markdown, html)",
    "json"
  )
  .option("--output-dir <path>", "Directory to save output files")
  .option("--filename <name>", "Custom filename for the export")
  .action((analysisId, options) => {
    try {
      executeExport(analysisId, options);
    } catch (error) {
      handleError(error);
    }
  });

// Add index command
program
  .command("index")
  .description("Manage repository index")
  .option("--rebuild", "Rebuild the entire index")
  .option("--update", "Update the index with new repositories")
  .option("--path <path>", "Path to scan for repositories when updating")
  .action((options) => {
    try {
      executeIndex(options);
    } catch (error) {
      handleError(error);
    }
  });

// Add config command
program
  .command("config")
  .description("Manage configuration")
  .option("--show", "Show current configuration")
  .option("--set <key=value>", "Set configuration value")
  .option("--reset", "Reset configuration to defaults")
  .option("--profile <name>", "Set active configuration profile")
  .option("--create-profile <name>", "Create a new configuration profile")
  .action((options) => {
    try {
      if (options.show) {
        console.log(chalk.blue("Current Configuration:"));
        console.log(JSON.stringify(config.store, null, 2));
      } else if (options.set) {
        const [key, value] = options.set.split("=");
        if (!key || value === undefined) {
          return;
        }

        // Handle nested properties
        if (key.includes(".")) {
          const [parent, child] = key.split(".");
          const parentObj = config.get(parent) as Record<string, any>;
          config.set(parent, { ...parentObj, [child]: value });
        } else {
          config.set(key, value);
        }

        console.log(chalk.green(`Configuration updated: ${key} = ${value}`));
      } else if (options.reset) {
        config.clear();
        console.log(chalk.green("Configuration reset to defaults"));
      } else if (options.profile) {
        const profiles = (config.get("profiles") as Record<string, any>) || {};
        const profileName = options.profile;

        if (!profiles[profileName]) {
          return;
        }

        config.set("activeProfile", profileName);
        console.log(chalk.green(`Activated profile: ${profileName}`));
      } else if (options.createProfile) {
        const profileName = options.createProfile;
        const profiles = (config.get("profiles") as Record<string, any>) || {};

        if (profiles[profileName]) {
          return;
        }

        // Create new profile with current settings
        const currentSettings = {
          apiUrl: config.get("apiUrl"),
          defaultOptions: config.get("defaultOptions"),
          outputDir: config.get("outputDir"),
        };

        profiles[profileName] = currentSettings;
        config.set("profiles", profiles);
        config.set("activeProfile", profileName);

        console.log(
          chalk.green(`Created and activated profile: ${profileName}`)
        );
      } else {
        console.log(
          chalk.yellow(
            "No action specified. Use --show, --set, --reset, --profile, or --create-profile"
          )
        );
      }
    } catch (error) {
      handleError(error);
    }
  });

// Add profile command for managing configuration profiles
program
  .command("profile")
  .description("Manage configuration profiles")
  .option("--list", "List available profiles")
  .option("--show <name>", "Show profile details")
  .option("--delete <name>", "Delete a profile")
  .option("--export <name>", "Export profile to file")
  .option("--import <path>", "Import profile from file")
  .action((options) => {
    try {
      const profiles = (config.get("profiles") as Record<string, any>) || {};
      const activeProfile = config.get("activeProfile") as string;

      if (options.list) {
        console.log(chalk.blue("Available Profiles:"));
        Object.keys(profiles).forEach((name) => {
          const marker = name === activeProfile ? "* " : "  ";
          console.log(`${marker}${name}`);
        });

        if (Object.keys(profiles).length === 0) {
          console.log(chalk.yellow("No profiles found"));
        }
      } else if (options.show) {
        const profileName = options.show;
        if (!profiles[profileName]) {
          return;
        }

        console.log(chalk.blue(`Profile: ${profileName}`));
        console.log(JSON.stringify(profiles[profileName], null, 2));
      } else if (options.delete) {
        const profileName = options.delete;
        if (!profiles[profileName]) {
          return;
        }

        // Remove profile
        const updatedProfiles = { ...profiles };
        delete updatedProfiles[profileName];
        config.set("profiles", updatedProfiles);

        // Reset active profile if deleting the active one
        if (activeProfile === profileName) {
          config.delete("activeProfile");
        }

        console.log(chalk.green(`Deleted profile: ${profileName}`));
      } else {
        console.log(
          chalk.yellow(
            "No action specified. Use --list, --show, --delete, --export, or --import"
          )
        );
      }
    } catch (error) {
      handleError(error);
    }
  });

// Only parse if this is the main module (not imported for tests)
if (process.argv[1]?.endsWith("index.js")) {
  program.parse();
}

// Export program for testing
export { program };
