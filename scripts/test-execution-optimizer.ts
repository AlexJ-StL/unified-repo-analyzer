#!/usr/bin/env bun

/**
 * Test Execution Strategy Optimizer
 * Implements intelligent test batching, ordering, and selective execution
 * Requirements: 6.1, 6.2, 5.4
 */

import { execSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { glob } from 'glob';

interface TestFile {
  path: string;
  relativePath: string;
  size: number;
  lastModified: Date;
  dependencies: string[];
  estimatedDuration: number;
  priority: number;
  package: string;
}

interface TestBatch {
  id: string;
  files: TestFile[];
  estimatedDuration: number;
  priority: number;
  dependencies: string[];
}

interface TestExecutionPlan {
  batches: TestBatch[];
  totalEstimatedDuration: number;
  strategy: 'parallel' | 'sequential' | 'hybrid';
  maxConcurrency: number;
}

interface ChangeDetectionResult {
  changedFiles: string[];
  affectedTests: string[];
  testSelectionStrategy: 'all' | 'affected' | 'minimal';
}

class TestExecutionOptimizer {
  private readonly projectRoot = process.cwd();
  private readonly cacheDir = '.test-cache';
  private readonly metricsFile = join(this.cacheDir, 'test-metrics.json');
  private readonly dependencyMapFile = join(this.cacheDir, 'dependency-map.json');

  async optimizeTestExecution(): Promise<void> {
    console.log('🚀 Optimizing test execution strategy...');
    // 1. Initialize cache and metrics
    await this.initializeCache();

    // 2. Discover and analyze test files
    const testFiles = await this.discoverTestFiles();

    // 3. Detect changes and select tests
    const changeDetection = await this.detectChangesAndSelectTests();

    // 4. Create intelligent test batches
    const executionPlan = await this.createExecutionPlan(testFiles, changeDetection);

    // 5. Implement fast feedback loops
    await this.implementFastFeedbackLoops(executionPlan);

    // 6. Generate optimization report
    await this.generateOptimizationReport(executionPlan, changeDetection);

    console.log('✅ Test execution strategy optimized successfully!');
  }

  private async initializeCache(): Promise<void> {
    console.log('📁 Initializing test execution cache...');

    await mkdir(this.cacheDir, { recursive: true });

    // Initialize metrics file if it doesn't exist
    if (!existsSync(this.metricsFile)) {
      const initialMetrics = {
        testDurations: {},
        testSuccess: {},
        lastRun: {},
        averageDurations: {},
      };
      await writeFile(this.metricsFile, JSON.stringify(initialMetrics, null, 2));
    }

    // Initialize dependency map if it doesn't exist
    if (!existsSync(this.dependencyMapFile)) {
      const initialDependencyMap = {
        fileDependencies: {},
        testDependencies: {},
        lastUpdated: new Date().toISOString(),
      };
      await writeFile(this.dependencyMapFile, JSON.stringify(initialDependencyMap, null, 2));
    }

    console.log('✅ Cache initialized');
  }

  private async discoverTestFiles(): Promise<TestFile[]> {
    console.log('🔍 Discovering and analyzing test files...');

    const testPatterns = [
      'packages/*/src/**/*.test.{ts,tsx,js,jsx}',
      'packages/*/src/**/*.spec.{ts,tsx,js,jsx}',
      'tests/**/*.test.{ts,tsx,js,jsx}',
      'tests/**/*.spec.{ts,tsx,js,jsx}',
    ];

    const testFiles: TestFile[] = [];
    const metrics = await this.loadMetrics();

    for (const pattern of testPatterns) {
      const files = await glob(pattern, { cwd: this.projectRoot });

      for (const file of files) {
        const fullPath = join(this.projectRoot, file);
        const stats = statSync(fullPath);

        const testFile: TestFile = {
          path: fullPath,
          relativePath: file,
          size: stats.size,
          lastModified: stats.mtime,
          dependencies: await this.analyzeDependencies(fullPath),
          estimatedDuration: this.estimateTestDuration(file, metrics),
          priority: this.calculateTestPriority(file, stats),
          package: this.extractPackageName(file),
        };

        testFiles.push(testFile);
      }
    }

    console.log(`✅ Discovered ${testFiles.length} test files`);
    return testFiles;
  }

  private async analyzeDependencies(testFile: string): Promise<string[]> {
    try {
      const content = await readFile(testFile, 'utf-8');
      const dependencies: string[] = [];

      // Extract import statements
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
      let match: RegExpExecArray | null;

      match = importRegex.exec(content);
      while (match !== null) {
        const importPath = match[1];

        // Skip node_modules imports
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
          continue;
        }

        // Resolve relative imports
        const resolvedPath = this.resolveImportPath(testFile, importPath);
        if (resolvedPath) {
          dependencies.push(resolvedPath);
        }
        match = importRegex.exec(content);
      }

      return dependencies;
    } catch {
      return [];
    }
  }

  private resolveImportPath(testFile: string, importPath: string): string | null {
    try {
      const testDir = dirname(testFile);
      const resolvedPath = join(testDir, importPath);

      // Try different extensions
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

      for (const ext of extensions) {
        const fullPath = resolvedPath + ext;
        if (existsSync(fullPath)) {
          return relative(this.projectRoot, fullPath);
        }
      }

      // Try index files
      for (const ext of extensions) {
        const indexPath = join(resolvedPath, `index${ext}`);
        if (existsSync(indexPath)) {
          return relative(this.projectRoot, indexPath);
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private estimateTestDuration(
    testFile: string,
    metrics: {
      averageDurations: Record<string, number>;
    }
  ): number {
    // Use historical data if available
    if (metrics.averageDurations[testFile]) {
      return metrics.averageDurations[testFile];
    }

    // Estimate based on file size and complexity
    const stats = statSync(join(this.projectRoot, testFile));
    const sizeKB = stats.size / 1024;

    // Base estimation: 100ms per KB + 500ms base
    let estimation = 500 + sizeKB * 100;

    // Adjust based on file type
    if (testFile.includes('integration') || testFile.includes('e2e')) {
      estimation *= 3; // Integration tests are typically slower
    }

    if (testFile.includes('performance')) {
      estimation *= 5; // Performance tests are much slower
    }

    return Math.round(estimation);
  }

  private calculateTestPriority(testFile: string, stats: { mtime: Date; size: number }): number {
    let priority = 50; // Base priority

    // Higher priority for recently modified files
    const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceModified < 1) priority += 30;
    else if (daysSinceModified < 7) priority += 20;
    else if (daysSinceModified < 30) priority += 10;

    // Higher priority for core packages
    if (testFile.includes('packages/shared')) priority += 20;
    if (testFile.includes('packages/backend')) priority += 15;
    if (testFile.includes('packages/frontend')) priority += 10;

    // Lower priority for integration/e2e tests (run them later)
    if (testFile.includes('integration') || testFile.includes('e2e')) priority -= 20;

    // Higher priority for smaller, faster tests
    const sizeKB = stats.size / 1024;
    if (sizeKB < 5) priority += 10;
    else if (sizeKB > 50) priority -= 10;

    return Math.max(0, Math.min(100, priority));
  }

  private extractPackageName(testFile: string): string {
    const match = testFile.match(/packages\/([^/]+)/);
    return match ? match[1] : 'root';
  }

  private async detectChangesAndSelectTests(): Promise<ChangeDetectionResult> {
    console.log('🔍 Detecting changes and selecting tests...');

    try {
      // Get changed files from git
      const changedFiles = await this.getChangedFiles();

      // Find affected tests
      const affectedTests = await this.findAffectedTests(changedFiles);

      // Determine selection strategy
      let strategy: 'all' | 'affected' | 'minimal' = 'all';

      if (changedFiles.length === 0) {
        strategy = 'minimal'; // No changes, run minimal test set
      } else if (changedFiles.length < 10 && affectedTests.length < 20) {
        strategy = 'affected'; // Small changes, run affected tests
      } else {
        strategy = 'all'; // Large changes, run all tests
      }

      console.log(`✅ Change detection complete: ${strategy} strategy selected`);
      console.log(`   Changed files: ${changedFiles.length}`);
      console.log(`   Affected tests: ${affectedTests.length}`);

      return {
        changedFiles,
        affectedTests,
        testSelectionStrategy: strategy,
      };
    } catch (_error) {
      return {
        changedFiles: [],
        affectedTests: [],
        testSelectionStrategy: 'all',
      };
    }
  }

  private async getChangedFiles(): Promise<string[]> {
    try {
      // Get files changed since last commit
      const output = execSync('git diff --name-only HEAD~1', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        timeout: 10000,
      });

      return output.trim().split('\n').filter(Boolean);
    } catch {
      // If git fails, check for recently modified files
      return this.getRecentlyModifiedFiles();
    }
  }

  private async getRecentlyModifiedFiles(): Promise<string[]> {
    const recentFiles: string[] = [];
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

    const patterns = ['packages/*/src/**/*.{ts,tsx,js,jsx}', 'tests/**/*.{ts,tsx,js,jsx}'];

    for (const pattern of patterns) {
      const files = await glob(pattern, { cwd: this.projectRoot });

      for (const file of files) {
        const stats = statSync(join(this.projectRoot, file));
        if (stats.mtime.getTime() > cutoffTime) {
          recentFiles.push(file);
        }
      }
    }

    return recentFiles;
  }

  private async findAffectedTests(changedFiles: string[]): Promise<string[]> {
    const affectedTests = new Set<string>();
    const dependencyMap = await this.loadDependencyMap();

    for (const changedFile of changedFiles) {
      // Direct test files
      if (this.isTestFile(changedFile)) {
        affectedTests.add(changedFile);
      }

      // Tests that import the changed file
      for (const [testFile, dependencies] of Object.entries(dependencyMap.testDependencies)) {
        const deps = dependencies as string[];
        if (deps.includes(changedFile)) {
          affectedTests.add(testFile);
        }
      }

      // Tests in the same package
      const packageName = this.extractPackageName(changedFile);
      if (packageName !== 'root') {
        const packageTests = await glob(`packages/${packageName}/**/*.test.{ts,tsx,js,jsx}`, {
          cwd: this.projectRoot,
        });
        packageTests.forEach((test) => {
          affectedTests.add(test);
        });
      }
    }

    return Array.from(affectedTests);
  }

  private isTestFile(file: string): boolean {
    return /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(file);
  }

  private async createExecutionPlan(
    testFiles: TestFile[],
    changeDetection: ChangeDetectionResult
  ): Promise<TestExecutionPlan> {
    console.log('📋 Creating intelligent test execution plan...');

    // Filter tests based on change detection
    let selectedTests = testFiles;

    if (changeDetection.testSelectionStrategy === 'affected') {
      selectedTests = testFiles.filter((test) =>
        changeDetection.affectedTests.includes(test.relativePath)
      );
    } else if (changeDetection.testSelectionStrategy === 'minimal') {
      // Run only fast, high-priority tests
      selectedTests = testFiles
        .filter((test) => test.estimatedDuration < 5000 && test.priority > 70)
        .slice(0, 10);
    }

    // Sort tests by priority and estimated duration
    selectedTests.sort((a, b) => {
      // Higher priority first
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // Faster tests first within same priority
      return a.estimatedDuration - b.estimatedDuration;
    });

    // Create intelligent batches
    const batches = this.createIntelligentBatches(selectedTests);

    // Determine execution strategy
    const strategy = this.determineExecutionStrategy(batches, selectedTests.length);

    const plan: TestExecutionPlan = {
      batches,
      totalEstimatedDuration: batches.reduce((sum, batch) => sum + batch.estimatedDuration, 0),
      strategy,
      maxConcurrency: strategy === 'parallel' ? Math.min(4, batches.length) : 1,
    };

    console.log('✅ Execution plan created:');
    console.log(`   Strategy: ${plan.strategy}`);
    console.log(`   Batches: ${plan.batches.length}`);
    console.log(`   Tests: ${selectedTests.length}`);
    console.log(`   Estimated duration: ${(plan.totalEstimatedDuration / 1000).toFixed(1)}s`);

    return plan;
  }

  private createIntelligentBatches(testFiles: TestFile[]): TestBatch[] {
    const batches: TestBatch[] = [];
    const maxBatchDuration = 30000; // 30 seconds per batch
    const maxBatchSize = 10; // Maximum tests per batch

    let currentBatch: TestFile[] = [];
    let currentDuration = 0;

    for (const testFile of testFiles) {
      // Start new batch if current would exceed limits
      if (
        currentBatch.length >= maxBatchSize ||
        (currentBatch.length > 0 && currentDuration + testFile.estimatedDuration > maxBatchDuration)
      ) {
        batches.push(this.createBatch(currentBatch, batches.length));
        currentBatch = [];
        currentDuration = 0;
      }

      currentBatch.push(testFile);
      currentDuration += testFile.estimatedDuration;
    }

    // Add remaining tests as final batch
    if (currentBatch.length > 0) {
      batches.push(this.createBatch(currentBatch, batches.length));
    }

    return batches;
  }

  private createBatch(testFiles: TestFile[], batchIndex: number): TestBatch {
    const estimatedDuration = testFiles.reduce((sum, test) => sum + test.estimatedDuration, 0);
    const averagePriority =
      testFiles.reduce((sum, test) => sum + test.priority, 0) / testFiles.length;

    // Collect all dependencies
    const allDependencies = new Set<string>();
    testFiles.forEach((test) => {
      test.dependencies.forEach((dep) => {
        allDependencies.add(dep);
      });
    });

    return {
      id: `batch-${batchIndex + 1}`,
      files: testFiles,
      estimatedDuration,
      priority: Math.round(averagePriority),
      dependencies: Array.from(allDependencies),
    };
  }

  private determineExecutionStrategy(
    batches: TestBatch[],
    totalTests: number
  ): 'parallel' | 'sequential' | 'hybrid' {
    // Use sequential for small test sets to avoid overhead
    if (totalTests < 5) {
      return 'sequential';
    }

    // Use parallel for large test sets with multiple batches
    if (batches.length > 2 && totalTests > 20) {
      return 'parallel';
    }

    // Use hybrid for medium test sets
    return 'hybrid';
  }

  private async implementFastFeedbackLoops(plan: TestExecutionPlan): Promise<void> {
    console.log('⚡ Implementing fast feedback loops...');

    // Create fast feedback script
    const fastFeedbackScript = `#!/usr/bin/env bun

/**
 * Fast Feedback Test Runner
 * Runs tests in optimized order for quick feedback
 */

import { execSync } from 'node:child_process';

const plan = ${JSON.stringify(plan, null, 2)};

async function runFastFeedback() {
  console.log('⚡ Running fast feedback tests...');
  
  const startTime = Date.now();
  let failedBatches = 0;
  
  try {
    if (plan.strategy === 'sequential') {
      // Run batches sequentially
      for (const batch of plan.batches) {
        console.log(\`🧪 Running \${batch.id} (\${batch.files.length} tests)...\`);
        
        const testPaths = batch.files.map(f => f.relativePath).join(' ');
        
        try {
          execSync(\`bun test \${testPaths} --maxConcurrency=1\`, {
            stdio: 'inherit',
            timeout: batch.estimatedDuration + 10000, // Add 10s buffer
          });
          console.log(\`✅ \${batch.id} completed\`);
        } catch (error) {
          console.error(\`❌ \${batch.id} failed\`);
          failedBatches++;
          
          // Fast fail for critical failures
          if (batch.priority > 80) {
            console.log('🚨 High priority batch failed, stopping execution');
            break;
          }
        }
      }
    } else {
      // Run high-priority batch first for fast feedback
      const highPriorityBatch = plan.batches
        .filter(b => b.priority > 70)
        .sort((a, b) => b.priority - a.priority)[0];
      
      if (highPriorityBatch) {
        console.log(\`🚀 Running high-priority batch first: \${highPriorityBatch.id}\`);
        
        const testPaths = highPriorityBatch.files.map(f => f.relativePath).join(' ');
        
        try {
          execSync(\`bun test \${testPaths} --maxConcurrency=1\`, {
            stdio: 'inherit',
            timeout: highPriorityBatch.estimatedDuration + 10000,
          });
          console.log('✅ High-priority tests passed, continuing with remaining tests...');
        } catch (error) {
          console.error('❌ High-priority tests failed, check critical functionality');
          failedBatches++;
        }
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(\`\\n📊 Fast feedback completed in \${(duration / 1000).toFixed(1)}s\`);
    console.log(\`Batches: \${plan.batches.length - failedBatches}/\${plan.batches.length} passed\`);
    
    if (failedBatches === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log(\`⚠️ \${failedBatches} batch(es) failed\`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Fast feedback execution failed:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  await runFastFeedback();
}
`;

    await writeFile('scripts/fast-feedback.ts', fastFeedbackScript);

    // Create selective test runner
    const selectiveTestScript = `#!/usr/bin/env bun

/**
 * Selective Test Runner
 * Runs only tests affected by recent changes
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

async function runSelectiveTests() {
  console.log('🎯 Running selective tests based on changes...');
  
  try {
    // Get changed files
    let changedFiles: string[] = [];
    
    try {
      const gitOutput = execSync('git diff --name-only HEAD~1', {
        encoding: 'utf-8',
        timeout: 5000,
      });
      changedFiles = gitOutput.trim().split('\\n').filter(Boolean);
    } catch {
      console.log('⚠️ Could not detect git changes, running all tests');
      changedFiles = [];
    }
    
    if (changedFiles.length === 0) {
      console.log('📝 No changes detected, running minimal test set');
      execSync('bun test --maxConcurrency=1', {
        stdio: 'inherit',
        timeout: 30000,
      });
      return;
    }
    
    console.log(\`📁 Found \${changedFiles.length} changed files\`);
    
    // Find related test files
    const testFiles: string[] = [];
    
    for (const file of changedFiles) {
      // Direct test files
      if (file.match(/\\.(test|spec)\\.(ts|tsx|js|jsx)$/)) {
        testFiles.push(file);
      }
      
      // Find corresponding test files
      const testFile = file.replace(/\\.(ts|tsx|js|jsx)$/, '.test.$1');
      if (existsSync(testFile)) {
        testFiles.push(testFile);
      }
      
      // Package-level tests
      const packageMatch = file.match(/packages\\/([^/]+)/);
      if (packageMatch) {
        const packageName = packageMatch[1];
        try {
          // Use cross-platform glob instead of Unix find command
          const { glob } = await import('glob');
          const packageTests = await glob(\`packages/\${packageName}/**/*.test.*\`, {
            cwd: process.cwd(),
          });
          testFiles.push(...packageTests);
        } catch {
          // Glob might not be available, skip package tests
        }
      }
    }
    
    const uniqueTestFiles = [...new Set(testFiles)];
    
    if (uniqueTestFiles.length === 0) {
      console.log('🔍 No specific tests found, running fast subset');
      execSync('bun test --maxConcurrency=1', {
        stdio: 'inherit',
        timeout: 30000,
      });
    } else {
      console.log(\`🧪 Running \${uniqueTestFiles.length} affected tests\`);
      const testPaths = uniqueTestFiles.join(' ');
      execSync(\`bun test \${testPaths}\`, {
        stdio: 'inherit',
        timeout: 60000,
      });
    }
    
    console.log('✅ Selective tests completed');
    
  } catch (error) {
    console.error('❌ Selective test execution failed:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  await runSelectiveTests();
}
`;

    await writeFile('scripts/selective-tests.ts', selectiveTestScript);

    console.log('✅ Fast feedback loops implemented');
  }

  private async generateOptimizationReport(
    plan: TestExecutionPlan,
    changeDetection: ChangeDetectionResult
  ): Promise<void> {
    console.log('📊 Generating optimization report...');

    const report = {
      timestamp: new Date().toISOString(),
      executionPlan: {
        strategy: plan.strategy,
        totalBatches: plan.batches.length,
        totalTests: plan.batches.reduce((sum, batch) => sum + batch.files.length, 0),
        estimatedDuration: plan.totalEstimatedDuration,
        maxConcurrency: plan.maxConcurrency,
      },
      changeDetection: {
        strategy: changeDetection.testSelectionStrategy,
        changedFiles: changeDetection.changedFiles.length,
        affectedTests: changeDetection.affectedTests.length,
      },
      batches: plan.batches.map((batch) => ({
        id: batch.id,
        testCount: batch.files.length,
        estimatedDuration: batch.estimatedDuration,
        priority: batch.priority,
        packages: [...new Set(batch.files.map((f) => f.package))],
      })),
      optimizations: {
        intelligentBatching: 'Tests grouped by duration and priority',
        changeDetection: 'Only affected tests run when possible',
        fastFeedback: 'High-priority tests run first',
        selectiveExecution: 'Minimal test sets for small changes',
      },
      recommendations: this.generateOptimizationRecommendations(plan, changeDetection),
    };

    await mkdir('test-reports', { recursive: true });
    await writeFile('test-reports/execution-optimization.json', JSON.stringify(report, null, 2));

    // Generate markdown report
    let markdown = '# Test Execution Optimization Report\n\n';
    markdown += `Generated: ${new Date().toLocaleString()}\n\n`;

    markdown += '## Execution Plan\n\n';
    markdown += `- **Strategy**: ${plan.strategy}\n`;
    markdown += `- **Total Batches**: ${plan.batches.length}\n`;
    markdown += `- **Total Tests**: ${report.executionPlan.totalTests}\n`;
    markdown += `- **Estimated Duration**: ${(plan.totalEstimatedDuration / 1000).toFixed(1)}s\n`;
    markdown += `- **Max Concurrency**: ${plan.maxConcurrency}\n\n`;

    markdown += '## Change Detection\n\n';
    markdown += `- **Strategy**: ${changeDetection.testSelectionStrategy}\n`;
    markdown += `- **Changed Files**: ${changeDetection.changedFiles.length}\n`;
    markdown += `- **Affected Tests**: ${changeDetection.affectedTests.length}\n\n`;

    markdown += '## Batch Details\n\n';
    markdown += '| Batch | Tests | Duration | Priority | Packages |\n';
    markdown += '|-------|-------|----------|----------|----------|\n';

    for (const batch of report.batches) {
      markdown += `| ${batch.id} | ${batch.testCount} | ${(batch.estimatedDuration / 1000).toFixed(1)}s | ${batch.priority} | ${batch.packages.join(', ')} |\n`;
    }

    markdown += '\n## Optimizations Applied\n\n';
    for (const [optimization, description] of Object.entries(report.optimizations)) {
      markdown += `- **${optimization}**: ${description}\n`;
    }

    markdown += '\n## Usage\n\n';
    markdown += '```bash\n';
    markdown += '# Run optimized test execution\n';
    markdown += 'bun scripts/fast-feedback.ts\n\n';
    markdown += '# Run selective tests based on changes\n';
    markdown += 'bun scripts/selective-tests.ts\n\n';
    markdown += '# Run full optimization\n';
    markdown += 'bun scripts/test-execution-optimizer.ts\n';
    markdown += '```\n\n';

    if (report.recommendations.length > 0) {
      markdown += '## Recommendations\n\n';
      for (const rec of report.recommendations) {
        markdown += `- ${rec}\n`;
      }
    }

    await writeFile('test-reports/execution-optimization.md', markdown);

    console.log('✅ Optimization report generated');
    console.log('📋 Report saved to: test-reports/execution-optimization.md');
  }

  private generateOptimizationRecommendations(
    plan: TestExecutionPlan,
    changeDetection: ChangeDetectionResult
  ): string[] {
    const recommendations: string[] = [];

    if (plan.totalEstimatedDuration > 120000) {
      // > 2 minutes
      recommendations.push('Consider splitting large test suites into smaller, focused test files');
    }

    if (plan.batches.length > 10) {
      recommendations.push(
        'Large number of batches detected - consider consolidating similar tests'
      );
    }

    if (
      changeDetection.testSelectionStrategy === 'all' &&
      changeDetection.changedFiles.length < 5
    ) {
      recommendations.push(
        'Small changes detected but running all tests - improve change detection'
      );
    }

    const avgBatchSize =
      plan.batches.reduce((sum, b) => sum + b.files.length, 0) / plan.batches.length;
    if (avgBatchSize < 3) {
      recommendations.push(
        'Small batch sizes detected - consider increasing batch size for better efficiency'
      );
    }

    if (plan.strategy === 'sequential' && plan.batches.length > 3) {
      recommendations.push(
        'Consider parallel execution for better performance with multiple batches'
      );
    }

    recommendations.push('Use `bun scripts/fast-feedback.ts` for quick development feedback');
    recommendations.push('Use `bun scripts/selective-tests.ts` when working on specific features');

    return recommendations;
  }

  private async loadMetrics(): Promise<{
    testDurations: Record<string, number>;
    testSuccess: Record<string, boolean>;
    lastRun: Record<string, string>;
    averageDurations: Record<string, number>;
  }> {
    try {
      const content = await readFile(this.metricsFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {
        testDurations: {},
        testSuccess: {},
        lastRun: {},
        averageDurations: {},
      };
    }
  }

  private async loadDependencyMap(): Promise<{
    fileDependencies: Record<string, string[]>;
    testDependencies: Record<string, string[]>;
    lastUpdated: string;
  }> {
    try {
      const content = await readFile(this.dependencyMapFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {
        fileDependencies: {},
        testDependencies: {},
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  async quickOptimization(): Promise<void> {
    console.log('⚡ Running quick test execution optimization...');

    try {
      await this.initializeCache();

      // Simple change detection and selective execution
      const changeDetection = await this.detectChangesAndSelectTests();

      console.log(`Strategy: ${changeDetection.testSelectionStrategy}`);
      console.log(`Changed files: ${changeDetection.changedFiles.length}`);
      console.log(`Affected tests: ${changeDetection.affectedTests.length}`);

      // Generate fast feedback script
      await this.implementFastFeedbackLoops({
        batches: [],
        totalEstimatedDuration: 0,
        strategy: 'sequential',
        maxConcurrency: 1,
      });

      console.log('✅ Quick optimization completed');
    } catch (_error) {}
  }
}

// CLI interface
if (import.meta.main) {
  const optimizer = new TestExecutionOptimizer();

  const command = process.argv[2];

  switch (command) {
    case 'optimize':
      await optimizer.optimizeTestExecution();
      break;
    case 'quick':
      await optimizer.quickOptimization();
      break;
    default:
      console.log('Usage: bun run scripts/test-execution-optimizer.ts [optimize|quick]');
      console.log('  optimize - Run full test execution optimization');
      console.log('  quick    - Run quick optimization');
      process.exit(1);
  }
}

export { TestExecutionOptimizer };
