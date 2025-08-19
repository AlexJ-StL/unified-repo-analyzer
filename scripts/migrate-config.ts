#!/usr/bin/env node

/**
 * Configuration Migration Utility
 *
 * This script migrates existing configuration to support the new Windows path handling
 * and logging features. It handles backward compatibility and provides smooth upgrades.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as readline from 'node:readline';

interface MigrationResult {
  success: boolean;
  changes: string[];
  warnings: string[];
  errors: string[];
}

interface ConfigMigration {
  version: string;
  description: string;
  migrate: (config: Record<string, string>) => MigrationResult;
}

class ConfigMigrator {
  private projectRoot: string;
  private backupDir: string;
  private migrations: ConfigMigration[];

  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.backupDir = path.join(this.projectRoot, 'backups', 'config');
    this.migrations = [
      {
        version: '1.0.0',
        description: 'Add Windows path handling configuration',
        migrate: this.migratePathHandling.bind(this),
      },
      {
        version: '1.1.0',
        description: 'Add comprehensive logging configuration',
        migrate: this.migrateLoggingConfig.bind(this),
      },
      {
        version: '1.2.0',
        description: 'Add performance and monitoring configuration',
        migrate: this.migratePerformanceConfig.bind(this),
      },
    ];
  }

  async run(): Promise<void> {
    console.log('🔧 Configuration Migration Utility');
    console.log('=====================================\n');

    try {
      // Create backup directory
      await this.ensureBackupDirectory();

      // Find configuration files
      const configFiles = await this.findConfigFiles();

      if (configFiles.length === 0) {
        console.log('ℹ️  No configuration files found. Creating default configuration...');
        await this.createDefaultConfig();
        return;
      }

      console.log(`📁 Found ${configFiles.length} configuration file(s):`);
      configFiles.forEach((file) => console.log(`   - ${file}`));
      console.log();

      // Ask for confirmation
      const proceed = await this.askConfirmation('Do you want to proceed with migration?');
      if (!proceed) {
        console.log('❌ Migration cancelled by user.');
        return;
      }

      // Migrate each configuration file
      for (const configFile of configFiles) {
        await this.migrateConfigFile(configFile);
      }

      console.log('\n✅ Configuration migration completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Review the migrated configuration files');
      console.log('   2. Update any custom settings as needed');
      console.log('   3. Test the application with the new configuration');
      console.log('   4. Remove backup files when satisfied with the migration');
    } catch (_error) {
      process.exit(1);
    }
  }

  private async ensureBackupDirectory(): Promise<void> {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  private async findConfigFiles(): Promise<string[]> {
    const configFiles: string[] = [];
    const possibleFiles = [
      '.env',
      '.env.local',
      '.env.development',
      '.env.production',
      '.env.test',
      'packages/backend/.env',
      'packages/backend/.env.local',
      'packages/backend/.env.development',
      'packages/backend/.env.production',
      'packages/frontend/.env',
      'packages/frontend/.env.local',
    ];

    for (const file of possibleFiles) {
      const fullPath = path.join(this.projectRoot, file);
      if (fs.existsSync(fullPath)) {
        configFiles.push(fullPath);
      }
    }

    return configFiles;
  }

  private async migrateConfigFile(configPath: string): Promise<void> {
    console.log(`\n🔄 Migrating: ${path.relative(this.projectRoot, configPath)}`);

    // Create backup
    const backupPath = await this.createBackup(configPath);
    console.log(`   📋 Backup created: ${path.relative(this.projectRoot, backupPath)}`);

    // Read current configuration
    const config = this.parseEnvFile(configPath);

    // Apply migrations
    let totalChanges = 0;
    let totalWarnings = 0;
    let totalErrors = 0;

    for (const migration of this.migrations) {
      console.log(`   🔧 Applying migration: ${migration.description}`);

      const result = migration.migrate(config);

      if (result.success) {
        totalChanges += result.changes.length;
        totalWarnings += result.warnings.length;
        totalErrors += result.errors.length;

        if (result.changes.length > 0) {
          console.log(`      ✅ Applied ${result.changes.length} change(s)`);
          result.changes.forEach((change) => console.log(`         - ${change}`));
        }

        if (result.warnings.length > 0) {
          console.log(`      ⚠️  ${result.warnings.length} warning(s)`);
          result.warnings.forEach((warning) => console.log(`         - ${warning}`));
        }

        if (result.errors.length > 0) {
          console.log(`      ❌ ${result.errors.length} error(s)`);
          result.errors.forEach((error) => console.log(`         - ${error}`));
        }
      } else {
        console.log('      ❌ Migration failed');
        result.errors.forEach((error) => console.log(`         - ${error}`));
      }
    }

    // Write updated configuration
    this.writeEnvFile(configPath, config);

    console.log(
      `   ✅ Migration completed: ${totalChanges} changes, ${totalWarnings} warnings, ${totalErrors} errors`
    );
  }

  private async createBackup(configPath: string): Promise<string> {
    const fileName = path.basename(configPath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `${fileName}.backup.${timestamp}`;
    const backupPath = path.join(this.backupDir, backupFileName);

    fs.copyFileSync(configPath, backupPath);
    return backupPath;
  }

  private parseEnvFile(filePath: string): Record<string, string> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const config: Record<string, string> = {};

    content.split('\n').forEach((line) => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          config[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    return config;
  }

  private writeEnvFile(filePath: string, config: Record<string, string>): void {
    const lines: string[] = [];

    // Add header comment
    lines.push('# Unified Repository Analyzer Configuration');
    lines.push('# This file has been migrated to support new features');
    lines.push(`# Migration date: ${new Date().toISOString()}`);
    lines.push('');

    // Group configurations by category
    const categories = {
      'Basic Configuration': ['NODE_ENV', 'PORT', 'HOST'],
      'Path Handling': [
        'WINDOWS_LONG_PATH_SUPPORT',
        'WINDOWS_UNC_PATH_SUPPORT',
        'WINDOWS_CASE_SENSITIVE',
        'PATH_VALIDATION_TIMEOUT',
        'ENABLE_PATH_CACHE',
        'PATH_CACHE_TTL',
        'NETWORK_TIMEOUT',
        'UNC_PATH_RETRY_COUNT',
        'UNC_PATH_RETRY_DELAY',
      ],
      'Logging Configuration': [
        'LOG_LEVEL',
        'LOG_DIR',
        'LOG_FORMAT',
        'LOG_INCLUDE_STACK_TRACE',
        'LOG_REDACT_SENSITIVE_DATA',
        'LOG_MAX_FILE_SIZE',
        'LOG_MAX_FILES',
        'LOG_ROTATE_DAILY',
      ],
      'HTTP Logging': [
        'LOG_HTTP_REQUESTS',
        'LOG_HTTP_RESPONSES',
        'LOG_HTTP_HEADERS',
        'LOG_HTTP_BODIES',
        'LOG_HTTP_MAX_BODY_SIZE',
      ],
      'Path Logging': [
        'LOG_PATH_OPERATIONS',
        'LOG_PERMISSION_CHECKS',
        'LOG_PATH_NORMALIZATION',
        'LOG_PATH_VALIDATION_DETAILS',
      ],
      'Performance Logging': [
        'LOG_PERFORMANCE_METRICS',
        'LOG_SLOW_OPERATIONS',
        'SLOW_OPERATION_THRESHOLD',
        'LOG_MEMORY_USAGE',
      ],
      'External Logging': [
        'LOG_EXTERNAL_ENABLED',
        'LOG_EXTERNAL_URL',
        'LOG_EXTERNAL_API_KEY',
        'LOG_EXTERNAL_TIMEOUT',
        'LOG_EXTERNAL_BATCH_SIZE',
      ],
    };

    // Write categorized configuration
    for (const [category, keys] of Object.entries(categories)) {
      const categoryKeys = keys.filter((key) => config[key] !== undefined);
      if (categoryKeys.length > 0) {
        lines.push(`# ${category}`);
        categoryKeys.forEach((key) => {
          lines.push(`${key}=${config[key]}`);
        });
        lines.push('');
      }
    }

    // Write remaining configuration
    const usedKeys = new Set(Object.values(categories).flat());
    const remainingKeys = Object.keys(config).filter((key) => !usedKeys.has(key));

    if (remainingKeys.length > 0) {
      lines.push('# Other Configuration');
      remainingKeys.forEach((key) => {
        lines.push(`${key}=${config[key]}`);
      });
      lines.push('');
    }

    fs.writeFileSync(filePath, lines.join('\n'));
  }

  private migratePathHandling(config: Record<string, string>): MigrationResult {
    const result: MigrationResult = {
      success: true,
      changes: [],
      warnings: [],
      errors: [],
    };

    // Add Windows path handling configuration
    const pathConfig = {
      WINDOWS_LONG_PATH_SUPPORT: 'true',
      WINDOWS_UNC_PATH_SUPPORT: 'true',
      WINDOWS_CASE_SENSITIVE: 'false',
      PATH_VALIDATION_TIMEOUT: '5000',
      ENABLE_PATH_CACHE: 'true',
      PATH_CACHE_TTL: '300000',
      NETWORK_TIMEOUT: '10000',
      UNC_PATH_RETRY_COUNT: '3',
      UNC_PATH_RETRY_DELAY: '1000',
    };

    for (const [key, defaultValue] of Object.entries(pathConfig)) {
      if (!config[key]) {
        config[key] = defaultValue;
        result.changes.push(`Added ${key}=${defaultValue}`);
      }
    }

    // Migrate legacy path settings
    if (config.MAX_PATH_LENGTH && !config.WINDOWS_LONG_PATH_SUPPORT) {
      const maxLength = Number.parseInt(config.MAX_PATH_LENGTH, 10);
      if (maxLength > 260) {
        config.WINDOWS_LONG_PATH_SUPPORT = 'true';
        result.changes.push('Enabled WINDOWS_LONG_PATH_SUPPORT based on MAX_PATH_LENGTH');
      }
    }

    return result;
  }

  private migrateLoggingConfig(config: Record<string, string>): MigrationResult {
    const result: MigrationResult = {
      success: true,
      changes: [],
      warnings: [],
      errors: [],
    };

    // Add core logging configuration
    const loggingConfig = {
      LOG_LEVEL: config.LOG_LEVEL || 'info',
      LOG_DIR: config.LOG_DIR || './logs',
      LOG_FORMAT: 'JSON',
      LOG_INCLUDE_STACK_TRACE: 'true',
      LOG_REDACT_SENSITIVE_DATA: 'true',
      LOG_MAX_FILE_SIZE: '10MB',
      LOG_MAX_FILES: '5',
      LOG_ROTATE_DAILY: 'true',
    };

    for (const [key, defaultValue] of Object.entries(loggingConfig)) {
      if (!config[key]) {
        config[key] = defaultValue;
        result.changes.push(`Added ${key}=${defaultValue}`);
      }
    }

    // Add HTTP logging configuration
    const httpLoggingConfig = {
      LOG_HTTP_REQUESTS: 'true',
      LOG_HTTP_RESPONSES: 'true',
      LOG_HTTP_HEADERS: 'false',
      LOG_HTTP_BODIES: 'false',
      LOG_HTTP_MAX_BODY_SIZE: '1024',
    };

    for (const [key, defaultValue] of Object.entries(httpLoggingConfig)) {
      if (!config[key]) {
        config[key] = defaultValue;
        result.changes.push(`Added ${key}=${defaultValue}`);
      }
    }

    // Add path logging configuration
    const pathLoggingConfig = {
      LOG_PATH_OPERATIONS: 'true',
      LOG_PERMISSION_CHECKS: 'false',
      LOG_PATH_NORMALIZATION: 'false',
      LOG_PATH_VALIDATION_DETAILS: 'false',
    };

    for (const [key, defaultValue] of Object.entries(pathLoggingConfig)) {
      if (!config[key]) {
        config[key] = defaultValue;
        result.changes.push(`Added ${key}=${defaultValue}`);
      }
    }

    // Migrate legacy logging settings
    if (config.DEBUG === 'true' && config.LOG_LEVEL === 'info') {
      config.LOG_LEVEL = 'debug';
      result.changes.push('Changed LOG_LEVEL to debug based on DEBUG flag');
    }

    if (config.VERBOSE === 'true') {
      config.LOG_HTTP_HEADERS = 'true';
      config.LOG_PATH_VALIDATION_DETAILS = 'true';
      result.changes.push('Enabled detailed logging based on VERBOSE flag');
    }

    return result;
  }

  private migratePerformanceConfig(config: Record<string, string>): MigrationResult {
    const result: MigrationResult = {
      success: true,
      changes: [],
      warnings: [],
      errors: [],
    };

    // Add performance logging configuration
    const performanceConfig = {
      LOG_PERFORMANCE_METRICS: 'false',
      LOG_SLOW_OPERATIONS: 'true',
      SLOW_OPERATION_THRESHOLD: '1000',
      LOG_MEMORY_USAGE: 'false',
    };

    for (const [key, defaultValue] of Object.entries(performanceConfig)) {
      if (!config[key]) {
        config[key] = defaultValue;
        result.changes.push(`Added ${key}=${defaultValue}`);
      }
    }

    // Add external logging configuration (disabled by default)
    const externalLoggingConfig = {
      LOG_EXTERNAL_ENABLED: 'false',
      LOG_EXTERNAL_URL: '',
      LOG_EXTERNAL_API_KEY: '',
      LOG_EXTERNAL_TIMEOUT: '10000',
      LOG_EXTERNAL_BATCH_SIZE: '100',
    };

    for (const [key, defaultValue] of Object.entries(externalLoggingConfig)) {
      if (!config[key]) {
        config[key] = defaultValue;
        if (defaultValue) {
          result.changes.push(`Added ${key}=${defaultValue}`);
        } else {
          result.changes.push(`Added ${key} (empty, configure as needed)`);
        }
      }
    }

    return result;
  }

  private async createDefaultConfig(): Promise<void> {
    const defaultConfigPath = path.join(this.projectRoot, '.env');
    const defaultConfig = {
      NODE_ENV: 'development',
      PORT: '3001',
      HOST: 'localhost',

      // Path Handling
      WINDOWS_LONG_PATH_SUPPORT: 'true',
      WINDOWS_UNC_PATH_SUPPORT: 'true',
      WINDOWS_CASE_SENSITIVE: 'false',
      PATH_VALIDATION_TIMEOUT: '5000',
      ENABLE_PATH_CACHE: 'true',
      PATH_CACHE_TTL: '300000',

      // Logging
      LOG_LEVEL: 'info',
      LOG_DIR: './logs',
      LOG_FORMAT: 'JSON',
      LOG_INCLUDE_STACK_TRACE: 'true',
      LOG_REDACT_SENSITIVE_DATA: 'true',
      LOG_MAX_FILE_SIZE: '10MB',
      LOG_MAX_FILES: '5',
      LOG_ROTATE_DAILY: 'true',

      // HTTP Logging
      LOG_HTTP_REQUESTS: 'true',
      LOG_HTTP_RESPONSES: 'true',
      LOG_HTTP_HEADERS: 'false',
      LOG_HTTP_BODIES: 'false',

      // Path Logging
      LOG_PATH_OPERATIONS: 'true',
      LOG_PERMISSION_CHECKS: 'false',
      LOG_PATH_NORMALIZATION: 'false',

      // Performance
      LOG_PERFORMANCE_METRICS: 'false',
      LOG_SLOW_OPERATIONS: 'true',
      SLOW_OPERATION_THRESHOLD: '1000',

      // External Logging (disabled)
      LOG_EXTERNAL_ENABLED: 'false',
    };

    this.writeEnvFile(defaultConfigPath, defaultConfig);
    console.log(`✅ Created default configuration: ${defaultConfigPath}`);
  }

  private async askConfirmation(question: string): Promise<boolean> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(`${question} (y/N): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  const migrator = new ConfigMigrator();
  migrator.run().catch((_error) => {
    process.exit(1);
  });
}

export { ConfigMigrator };
