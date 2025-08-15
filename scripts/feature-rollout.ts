#!/usr/bin/env node

/**
 * Gradual Feature Rollout Script
 * 
 * This script manages the gradual rollout of new Windows path handling and logging features.
 * It allows enabling features incrementally to minimize risk and ensure stability.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

interface FeatureFlag {
  name: string;
  description: string;
  envVar: string;
  defaultValue: string;
  dependencies?: string[];
  riskLevel: 'low' | 'medium' | 'high';
  category: 'path-handling' | 'logging' | 'performance' | 'monitoring';
}

interface RolloutStage {
  name: string;
  description: string;
  features: string[];
  prerequisites?: string[];
}

class FeatureRolloutManager {
  private projectRoot: string;
  private configPath: string;
  private features: FeatureFlag[];
  private rolloutStages: RolloutStage[];

  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.configPath = path.join(this.projectRoot, '.env');
    
    this.features = [
      // Path Handling Features
      {
        name: 'windows-path-normalization',
        description: 'Automatic Windows path normalization',
        envVar: 'ENABLE_PATH_NORMALIZATION',
        defaultValue: 'true',
        riskLevel: 'low',
        category: 'path-handling'
      },
      {
        name: 'windows-long-path-support',
        description: 'Support for Windows long paths (>260 characters)',
        envVar: 'WINDOWS_LONG_PATH_SUPPORT',
        defaultValue: 'false',
        riskLevel: 'medium',
        category: 'path-handling'
      },
      {
        name: 'unc-path-support',
        description: 'Support for UNC network paths',
        envVar: 'WINDOWS_UNC_PATH_SUPPORT',
        defaultValue: 'false',
        riskLevel: 'high',
        category: 'path-handling'
      },
      {
        name: 'path-validation-caching',
        description: 'Cache path validation results for performance',
        envVar: 'ENABLE_PATH_CACHE',
        defaultValue: 'true',
        dependencies: ['windows-path-normalization'],
        riskLevel: 'low',
        category: 'performance'
      },
      {
        name: 'advanced-permission-checking',
        description: 'Detailed Windows permission validation',
        envVar: 'ENABLE_ADVANCED_PERMISSIONS',
        defaultValue: 'false',
        dependencies: ['windows-path-normalization'],
        riskLevel: 'medium',
        category: 'path-handling'
      },

      // Logging Features
      {
        name: 'structured-logging',
        description: 'JSON-structured log format',
        envVar: 'LOG_FORMAT',
        defaultValue: 'TEXT',
        riskLevel: 'low',
        category: 'logging'
      },
      {
        name: 'http-request-logging',
        description: 'Detailed HTTP request/response logging',
        envVar: 'LOG_HTTP_REQUESTS',
        defaultValue: 'false',
        riskLevel: 'low',
        category: 'logging'
      },
      {
        name: 'path-operation-logging',
        description: 'Log all path validation and processing operations',
        envVar: 'LOG_PATH_OPERATIONS',
        defaultValue: 'false',
        dependencies: ['structured-logging'],
        riskLevel: 'low',
        category: 'logging'
      },
      {
        name: 'sensitive-data-redaction',
        description: 'Automatic redaction of sensitive information in logs',
        envVar: 'LOG_REDACT_SENSITIVE_DATA',
        defaultValue: 'true',
        dependencies: ['structured-logging'],
        riskLevel: 'low',
        category: 'logging'
      },
      {
        name: 'log-rotation',
        description: 'Automatic log file rotation and cleanup',
        envVar: 'LOG_ROTATE_DAILY',
        defaultValue: 'false',
        riskLevel: 'low',
        category: 'logging'
      },

      // Performance and Monitoring Features
      {
        name: 'performance-metrics',
        description: 'Collect and log performance metrics',
        envVar: 'LOG_PERFORMANCE_METRICS',
        defaultValue: 'false',
        riskLevel: 'low',
        category: 'performance'
      },
      {
        name: 'slow-operation-detection',
        description: 'Detect and log slow operations',
        envVar: 'LOG_SLOW_OPERATIONS',
        defaultValue: 'false',
        dependencies: ['performance-metrics'],
        riskLevel: 'low',
        category: 'performance'
      },
      {
        name: 'memory-usage-monitoring',
        description: 'Monitor and log memory usage',
        envVar: 'LOG_MEMORY_USAGE',
        defaultValue: 'false',
        dependencies: ['performance-metrics'],
        riskLevel: 'medium',
        category: 'monitoring'
      },
      {
        name: 'external-logging',
        description: 'Send logs to external logging services',
        envVar: 'LOG_EXTERNAL_ENABLED',
        defaultValue: 'false',
        dependencies: ['structured-logging', 'sensitive-data-redaction'],
        riskLevel: 'high',
        category: 'logging'
      }
    ];

    this.rolloutStages = [
      {
        name: 'stage-1-basic',
        description: 'Basic path handling and logging improvements',
        features: [
          'windows-path-normalization',
          'structured-logging',
          'sensitive-data-redaction'
        ]
      },
      {
        name: 'stage-2-enhanced',
        description: 'Enhanced logging and performance features',
        prerequisites: ['stage-1-basic'],
        features: [
          'http-request-logging',
          'path-operation-logging',
          'log-rotation',
          'path-validation-caching',
          'performance-metrics'
        ]
      },
      {
        name: 'stage-3-advanced',
        description: 'Advanced path handling and monitoring',
        prerequisites: ['stage-2-enhanced'],
        features: [
          'windows-long-path-support',
          'advanced-permission-checking',
          'slow-operation-detection',
          'memory-usage-monitoring'
        ]
      },
      {
        name: 'stage-4-enterprise',
        description: 'Enterprise features with higher risk',
        prerequisites: ['stage-3-advanced'],
        features: [
          'unc-path-support',
          'external-logging'
        ]
      }
    ];
  }

  async run(): Promise<void> {
    console.log('🚀 Feature Rollout Manager');
    console.log('==========================\n');

    const args = process.argv.slice(2);
    const command = args[0] || 'interactive';

    switch (command) {
      case 'list':
        await this.listFeatures();
        break;
      case 'status':
        await this.showStatus();
        break;
      case 'enable':
        if (args[1]) {
          await this.enableFeature(args[1]);
        } else {
          console.log('Usage: npm run feature-rollout enable <feature-name>');
        }
        break;
      case 'disable':
        if (args[1]) {
          await this.disableFeature(args[1]);
        } else {
          console.log('Usage: npm run feature-rollout disable <feature-name>');
        }
        break;
      case 'stage':
        if (args[1]) {
          await this.enableStage(args[1]);
        } else {
          console.log('Usage: npm run feature-rollout stage <stage-name>');
        }
        break;
      case 'reset':
        await this.resetToDefaults();
        break;
      case 'interactive':
      default:
        await this.runInteractive();
        break;
    }
  }

  private async listFeatures(): Promise<void> {
    console.log('📋 Available Features');
    console.log('====================\n');

    const categories = [...new Set(this.features.map(f => f.category))];
    
    for (const category of categories) {
      console.log(`\n📁 ${category.toUpperCase().replace('-', ' ')}`);
      console.log('─'.repeat(40));
      
      const categoryFeatures = this.features.filter(f => f.category === category);
      
      for (const feature of categoryFeatures) {
        const status = await this.getFeatureStatus(feature);
        const statusIcon = status.enabled ? '✅' : '❌';
        const riskIcon = this.getRiskIcon(feature.riskLevel);
        
        console.log(`${statusIcon} ${riskIcon} ${feature.name}`);
        console.log(`   ${feature.description}`);
        console.log(`   Environment: ${feature.envVar}=${status.value}`);
        
        if (feature.dependencies) {
          console.log(`   Dependencies: ${feature.dependencies.join(', ')}`);
        }
        
        console.log();
      }
    }
  }

  private async showStatus(): Promise<void> {
    console.log('📊 Feature Status Overview');
    console.log('==========================\n');

    const currentConfig = await this.loadCurrentConfig();
    
    // Show rollout stages
    console.log('🎯 Rollout Stages:');
    for (const stage of this.rolloutStages) {
      const stageStatus = await this.getStageStatus(stage);
      const statusIcon = stageStatus.completed ? '✅' : stageStatus.partial ? '🔄' : '❌';
      
      console.log(`${statusIcon} ${stage.name}: ${stage.description}`);
      console.log(`   Progress: ${stageStatus.enabledCount}/${stageStatus.totalCount} features enabled`);
      
      if (stageStatus.partial) {
        const disabledFeatures = stage.features.filter(fname => {
          const feature = this.features.find(f => f.name === fname);
          return feature && !this.isFeatureEnabled(feature, currentConfig);
        });
        console.log(`   Remaining: ${disabledFeatures.join(', ')}`);
      }
      
      console.log();
    }

    // Show feature summary by category
    console.log('\n📈 Features by Category:');
    const categories = [...new Set(this.features.map(f => f.category))];
    
    for (const category of categories) {
      const categoryFeatures = this.features.filter(f => f.category === category);
      const enabledCount = categoryFeatures.filter(f => this.isFeatureEnabled(f, currentConfig)).length;
      
      console.log(`${category}: ${enabledCount}/${categoryFeatures.length} enabled`);
    }
  }

  private async enableFeature(featureName: string): Promise<void> {
    const feature = this.features.find(f => f.name === featureName);
    if (!feature) {
      console.log(`❌ Feature not found: ${featureName}`);
      return;
    }

    console.log(`🔧 Enabling feature: ${feature.name}`);
    console.log(`   Description: ${feature.description}`);
    console.log(`   Risk Level: ${feature.riskLevel}`);

    // Check dependencies
    if (feature.dependencies) {
      const currentConfig = await this.loadCurrentConfig();
      const missingDeps = feature.dependencies.filter(depName => {
        const dep = this.features.find(f => f.name === depName);
        return dep && !this.isFeatureEnabled(dep, currentConfig);
      });

      if (missingDeps.length > 0) {
        console.log(`⚠️  Missing dependencies: ${missingDeps.join(', ')}`);
        const enableDeps = await this.askConfirmation('Enable dependencies automatically?');
        
        if (enableDeps) {
          for (const depName of missingDeps) {
            await this.enableFeature(depName);
          }
        } else {
          console.log('❌ Cannot enable feature without dependencies');
          return;
        }
      }
    }

    // Enable the feature
    await this.updateFeatureConfig(feature, 'true');
    console.log(`✅ Feature enabled: ${feature.name}`);
  }

  private async disableFeature(featureName: string): Promise<void> {
    const feature = this.features.find(f => f.name === featureName);
    if (!feature) {
      console.log(`❌ Feature not found: ${featureName}`);
      return;
    }

    console.log(`🔧 Disabling feature: ${feature.name}`);

    // Check if other features depend on this one
    const dependentFeatures = this.features.filter(f => 
      f.dependencies && f.dependencies.includes(featureName)
    );

    if (dependentFeatures.length > 0) {
      const currentConfig = await this.loadCurrentConfig();
      const enabledDependents = dependentFeatures.filter(f => 
        this.isFeatureEnabled(f, currentConfig)
      );

      if (enabledDependents.length > 0) {
        console.log(`⚠️  This feature is required by: ${enabledDependents.map(f => f.name).join(', ')}`);
        const disableDependents = await this.askConfirmation('Disable dependent features?');
        
        if (disableDependents) {
          for (const dep of enabledDependents) {
            await this.disableFeature(dep.name);
          }
        } else {
          console.log('❌ Cannot disable feature with active dependents');
          return;
        }
      }
    }

    // Disable the feature
    await this.updateFeatureConfig(feature, feature.defaultValue);
    console.log(`✅ Feature disabled: ${feature.name}`);
  }

  private async enableStage(stageName: string): Promise<void> {
    const stage = this.rolloutStages.find(s => s.name === stageName);
    if (!stage) {
      console.log(`❌ Stage not found: ${stageName}`);
      return;
    }

    console.log(`🎯 Enabling rollout stage: ${stage.name}`);
    console.log(`   Description: ${stage.description}`);

    // Check prerequisites
    if (stage.prerequisites) {
      for (const prereqName of stage.prerequisites) {
        const prereqStage = this.rolloutStages.find(s => s.name === prereqName);
        if (prereqStage) {
          const prereqStatus = await this.getStageStatus(prereqStage);
          if (!prereqStatus.completed) {
            console.log(`⚠️  Prerequisite stage not completed: ${prereqName}`);
            const enablePrereq = await this.askConfirmation('Enable prerequisite stage?');
            
            if (enablePrereq) {
              await this.enableStage(prereqName);
            } else {
              console.log('❌ Cannot enable stage without prerequisites');
              return;
            }
          }
        }
      }
    }

    // Enable all features in the stage
    console.log(`\n🔧 Enabling ${stage.features.length} features...`);
    
    for (const featureName of stage.features) {
      const feature = this.features.find(f => f.name === featureName);
      if (feature) {
        console.log(`   Enabling: ${feature.name}`);
        await this.updateFeatureConfig(feature, 'true');
      }
    }

    console.log(`✅ Stage enabled: ${stage.name}`);
  }

  private async resetToDefaults(): Promise<void> {
    console.log('🔄 Resetting all features to default values...');
    
    const confirm = await this.askConfirmation('This will reset all feature flags to their default values. Continue?');
    if (!confirm) {
      console.log('❌ Reset cancelled');
      return;
    }

    for (const feature of this.features) {
      await this.updateFeatureConfig(feature, feature.defaultValue);
    }

    console.log('✅ All features reset to defaults');
  }

  private async runInteractive(): Promise<void> {
    console.log('🎮 Interactive Feature Rollout');
    console.log('==============================\n');

    while (true) {
      console.log('Available commands:');
      console.log('1. List all features');
      console.log('2. Show current status');
      console.log('3. Enable a feature');
      console.log('4. Disable a feature');
      console.log('5. Enable a rollout stage');
      console.log('6. Reset to defaults');
      console.log('7. Exit');

      const choice = await this.askInput('\nEnter your choice (1-7): ');

      switch (choice) {
        case '1':
          await this.listFeatures();
          break;
        case '2':
          await this.showStatus();
          break;
        case '3': {
          const enableFeature = await this.askInput('Enter feature name to enable: ');
          await this.enableFeature(enableFeature);
          break;
        } {
        case '4':
          const disableFeature = await this.askInput('Enter feature name to disable: ');
          await 
        }this.dis {ableFeature(disableFeature);
          break;
        case '5':
          const 
        }stage = await this.askInput('Enter stage name to enable: ');
          await this.enableStage(stage);
          break;
        case '6':
          await this.resetToDefaults();
          break;
        case '7':
          console.log('👋 Goodbye!');
          return;
        default:
          console.log('❌ Invalid choice');
      }

      console.log('\n' + '─'.repeat(50) + '\n');
    }
  }

  private async getFeatureStatus(feature: FeatureFlag): Promise<{ enabled: boolean; value: string }> {
    const config = await this.loadCurrentConfig();
    const value = config[feature.envVar] || feature.defaultValue;
    const enabled = this.isFeatureEnabled(feature, config);
    
    return { enabled, value };
  }

  private async getStageStatus(stage: RolloutStage): Promise<{ completed: boolean; partial: boolean; enabledCount: number; totalCount: number }> {
    const config = await this.loadCurrentConfig();
    const totalCount = stage.features.length;
    let enabledCount = 0;

    for (const featureName of stage.features) {
      const feature = this.features.find(f => f.name === featureName);
      if (feature && this.isFeatureEnabled(feature, config)) {
        enabledCount++;
      }
    }

    return {
      completed: enabledCount === totalCount,
      partial: enabledCount > 0 && enabledCount < totalCount,
      enabledCount,
      totalCount
    };
  }

  private isFeatureEnabled(feature: FeatureFlag, config: Record<string, string>): boolean {
    const value = config[feature.envVar] || feature.defaultValue;
    
    // Handle different value types
    if (feature.envVar === 'LOG_FORMAT') {
      return value === 'JSON';
    }
    
    return value === 'true';
  }

  private async loadCurrentConfig(): Promise<Record<string, string>> {
    if (!fs.existsSync(this.configPath)) {
      return {};
    }

    const content = fs.readFileSync(this.configPath, 'utf-8');
    const config: Record<string, string> = {};

    content.split('\n').forEach(line => {
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

  private async updateFeatureConfig(feature: FeatureFlag, value: string): Promise<void> {
    const config = await this.loadCurrentConfig();
    config[feature.envVar] = value;

    // Write updated configuration
    const lines: string[] = [];
    lines.push('# Unified Repository Analyzer Configuration');
    lines.push(`# Updated: ${new Date().toISOString()}`);
    lines.push('');

    // Write configuration grouped by category
    const categories = [...new Set(this.features.map(f => f.category))];
    
    for (const category of categories) {
      const categoryFeatures = this.features.filter(f => f.category === category);
      const categoryKeys = categoryFeatures.map(f => f.envVar);
      const categoryConfig = categoryKeys.filter(key => config[key] !== undefined);
      
      if (categoryConfig.length > 0) {
        lines.push(`# ${category.toUpperCase().replace('-', ' ')} FEATURES`);
        categoryConfig.forEach(key => {
          lines.push(`${key}=${config[key]}`);
        });
        lines.push('');
      }
    }

    // Write remaining configuration
    const usedKeys = new Set(this.features.map(f => f.envVar));
    const remainingKeys = Object.keys(config).filter(key => !usedKeys.has(key));
    
    if (remainingKeys.length > 0) {
      lines.push('# OTHER CONFIGURATION');
      remainingKeys.forEach(key => {
        lines.push(`${key}=${config[key]}`);
      });
      lines.push('');
    }

    fs.writeFileSync(this.configPath, lines.join('\n'));
  }

  private getRiskIcon(riskLevel: string): string {
    switch (riskLevel) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  }

  private async askConfirmation(question: string): Promise<boolean> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`${question} (y/N): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
  }

  private async askInput(question: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }
}

// Run the feature rollout manager if this script is executed directly
if (require.main === module) {
  const manager = new FeatureRolloutManager();
  manager.run().catch(error => {
    console.error('Feature rollout failed:', error);
    process.exit(1);
  });
}

export { FeatureRolloutManager };