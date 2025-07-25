/**
 * End-to-end tests for CLI functionality
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import {
  createTestRepository,
  TEST_REPOSITORIES,
  TestRepository,
  PerformanceMonitor,
} from './setup';

describe('CLI End-to-End Tests', () => {
  let testRepos: TestRepository[] = [];
  const perfMonitor = new PerformanceMonitor();
  const cliPath = join(__dirname, '../../packages/cli/dist/index.js');

  afterAll(async () => {
    await Promise.all(testRepos.map((repo) => repo.cleanup()));
  });

  const runCLI = (
    args: string[]
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> => {
    return new Promise((resolve) => {
      const child = spawn('node', [cliPath, ...args], {
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'test' },
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (exitCode) => {
        resolve({ stdout, stderr, exitCode: exitCode || 0 });
      });
    });
  };

  describe('Analyze Command', () => {
    test('should analyze a JavaScript repository', async () => {
      const endTimer = perfMonitor.startTimer('cli-analyze-js');

      const repo = await createTestRepository('cli-js-test', TEST_REPOSITORIES.simpleJavaScript);
      testRepos.push(repo);

      const result = await runCLI(['analyze', repo.path, '--mode', 'quick', '--format', 'json']);

      expect(result.exitCode).toBe(0);
      expect(result.stderr).toBe('');

      const output = JSON.parse(result.stdout);
      expect(output).toHaveProperty('name');
      expect(output).toHaveProperty('language', 'JavaScript');
      expect(output.languages).toContain('JavaScript');

      const duration = endTimer();
      expect(duration).toBeLessThan(30000);
    });

    test('should analyze with different output formats', async () => {
      const repo = await createTestRepository('cli-format-test', TEST_REPOSITORIES.reactTypeScript);
      testRepos.push(repo);

      // Test JSON format
      const jsonResult = await runCLI(['analyze', repo.path, '--format', 'json']);
      expect(jsonResult.exitCode).toBe(0);
      expect(() => JSON.parse(jsonResult.stdout)).not.toThrow();

      // Test Markdown format
      const mdResult = await runCLI(['analyze', repo.path, '--format', 'markdown']);
      expect(mdResult.exitCode).toBe(0);
      expect(mdResult.stdout).toContain('# Repository Analysis');

      // Test HTML format
      const htmlResult = await runCLI(['analyze', repo.path, '--format', 'html']);
      expect(htmlResult.exitCode).toBe(0);
      expect(htmlResult.stdout).toContain('<html');
    });

    test('should handle invalid repository path', async () => {
      const result = await runCLI(['analyze', '/nonexistent/path']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Path not found');
    });

    test('should respect analysis options', async () => {
      const repo = await createTestRepository('cli-options-test', TEST_REPOSITORIES.pythonProject);
      testRepos.push(repo);

      const result = await runCLI([
        'analyze',
        repo.path,
        '--mode',
        'comprehensive',
        '--max-files',
        '50',
        '--max-lines-per-file',
        '1000',
        '--include-tree',
        '--format',
        'json',
      ]);

      expect(result.exitCode).toBe(0);

      const output = JSON.parse(result.stdout);
      expect(output.metadata.analysisMode).toBe('comprehensive');
      expect(output.structure).toHaveProperty('tree');
    });
  });

  describe('Batch Command', () => {
    test('should process multiple repositories', async () => {
      const endTimer = perfMonitor.startTimer('cli-batch');

      // Create test directory with multiple repositories
      const batchDir = join(tmpdir(), 'cli-batch-test');
      await mkdir(batchDir, { recursive: true });

      const jsRepo = await createTestRepository(
        join(batchDir, 'js-project'),
        TEST_REPOSITORIES.simpleJavaScript
      );
      const reactRepo = await createTestRepository(
        join(batchDir, 'react-project'),
        TEST_REPOSITORIES.reactTypeScript
      );
      const pythonRepo = await createTestRepository(
        join(batchDir, 'python-project'),
        TEST_REPOSITORIES.pythonProject
      );

      testRepos.push(jsRepo, reactRepo, pythonRepo);

      const result = await runCLI(['batch', batchDir, '--mode', 'quick', '--format', 'json']);

      expect(result.exitCode).toBe(0);

      const output = JSON.parse(result.stdout);
      expect(output).toHaveProperty('results');
      expect(output.results).toHaveLength(3);
      expect(output.results.every((r: any) => r.status === 'completed')).toBe(true);

      const duration = endTimer();
      expect(duration).toBeLessThan(60000);

      // Cleanup
      await rm(batchDir, { recursive: true, force: true });
    });

    test('should handle partial failures in batch', async () => {
      const batchDir = join(tmpdir(), 'cli-batch-partial-test');
      await mkdir(batchDir, { recursive: true });

      const validRepo = await createTestRepository(
        join(batchDir, 'valid-project'),
        TEST_REPOSITORIES.simpleJavaScript
      );
      testRepos.push(validRepo);

      // Create an invalid directory
      const invalidDir = join(batchDir, 'invalid-project');
      await mkdir(invalidDir);
      await writeFile(join(invalidDir, 'invalid.txt'), 'not a valid project');

      const result = await runCLI(['batch', batchDir, '--mode', 'quick']);

      expect(result.exitCode).toBe(0); // Should not fail completely

      const output = JSON.parse(result.stdout);
      expect(output.results).toHaveLength(2);
      expect(output.results.some((r: any) => r.status === 'completed')).toBe(true);
      expect(output.results.some((r: any) => r.status === 'failed')).toBe(true);

      // Cleanup
      await rm(batchDir, { recursive: true, force: true });
    });
  });

  describe('Search Command', () => {
    test('should search repositories by language', async () => {
      // First analyze some repositories to populate the index
      const jsRepo = await createTestRepository('search-js', TEST_REPOSITORIES.simpleJavaScript);
      const reactRepo = await createTestRepository(
        'search-react',
        TEST_REPOSITORIES.reactTypeScript
      );
      testRepos.push(jsRepo, reactRepo);

      // Analyze repositories to add them to index
      await runCLI(['analyze', jsRepo.path]);
      await runCLI(['analyze', reactRepo.path]);

      // Search by language
      const result = await runCLI(['search', '--languages', 'JavaScript,TypeScript']);

      expect(result.exitCode).toBe(0);

      const output = JSON.parse(result.stdout);
      expect(Array.isArray(output)).toBe(true);
      if (output.length > 0) {
        expect(
          output.every((repo: any) =>
            repo.languages.some((lang: string) => ['JavaScript', 'TypeScript'].includes(lang))
          )
        ).toBe(true);
      }
    });

    test('should search repositories by framework', async () => {
      const reactRepo = await createTestRepository(
        'search-framework',
        TEST_REPOSITORIES.reactTypeScript
      );
      testRepos.push(reactRepo);

      await runCLI(['analyze', reactRepo.path]);

      const result = await runCLI(['search', '--frameworks', 'React']);

      expect(result.exitCode).toBe(0);

      const output = JSON.parse(result.stdout);
      if (output.length > 0) {
        expect(output.some((repo: any) => repo.frameworks.includes('React'))).toBe(true);
      }
    });
  });

  describe('Export Command', () => {
    test('should export analysis results', async () => {
      const repo = await createTestRepository('export-test', TEST_REPOSITORIES.simpleJavaScript);
      testRepos.push(repo);

      // First analyze the repository
      const analyzeResult = await runCLI(['analyze', repo.path, '--format', 'json']);
      expect(analyzeResult.exitCode).toBe(0);

      const analysis = JSON.parse(analyzeResult.stdout);

      // Export in different formats
      const jsonExport = await runCLI(['export', analysis.id, '--format', 'json']);
      expect(jsonExport.exitCode).toBe(0);
      expect(() => JSON.parse(jsonExport.stdout)).not.toThrow();

      const mdExport = await runCLI(['export', analysis.id, '--format', 'markdown']);
      expect(mdExport.exitCode).toBe(0);
      expect(mdExport.stdout).toContain('# Repository Analysis');

      const htmlExport = await runCLI(['export', analysis.id, '--format', 'html']);
      expect(htmlExport.exitCode).toBe(0);
      expect(htmlExport.stdout).toContain('<html');
    });
  });

  describe('Index Management', () => {
    test('should rebuild index', async () => {
      const result = await runCLI(['index', '--rebuild']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Index rebuilt successfully');
    });

    test('should update index', async () => {
      const result = await runCLI(['index', '--update']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Index updated successfully');
    });
  });

  describe('Configuration', () => {
    test('should handle configuration file', async () => {
      const configDir = join(tmpdir(), 'cli-config-test');
      await mkdir(configDir, { recursive: true });

      const configFile = join(configDir, '.repo-analyzer.json');
      const config = {
        defaultMode: 'standard',
        defaultFormat: 'markdown',
        maxFiles: 500,
        llmProvider: 'claude',
      };

      await writeFile(configFile, JSON.stringify(config, null, 2));

      const repo = await createTestRepository('config-test', TEST_REPOSITORIES.simpleJavaScript);
      testRepos.push(repo);

      const result = await runCLI(['analyze', repo.path, '--config', configFile]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('# Repository Analysis'); // Should use markdown format

      // Cleanup
      await rm(configDir, { recursive: true, force: true });
    });
  });

  describe('Error Handling', () => {
    test('should show help for invalid commands', async () => {
      const result = await runCLI(['invalid-command']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Unknown command');
    });

    test('should validate required arguments', async () => {
      const result = await runCLI(['analyze']);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Missing required argument');
    });

    test('should handle permission errors gracefully', async () => {
      // Create a directory without read permissions (Unix-like systems)
      if (process.platform !== 'win32') {
        const restrictedDir = join(tmpdir(), 'restricted-dir');
        await mkdir(restrictedDir, { mode: 0o000 });

        const result = await runCLI(['analyze', restrictedDir]);

        expect(result.exitCode).toBe(1);
        expect(result.stderr).toContain('Permission denied');

        // Cleanup
        await rm(restrictedDir, { recursive: true, force: true });
      }
    });
  });

  afterAll(() => {
    // Log performance statistics
    console.log('\n=== CLI Performance Statistics ===');
    const stats = perfMonitor.getAllStats();
    Object.entries(stats).forEach(([name, stat]) => {
      if (stat) {
        console.log(`${name}:`);
        console.log(`  Count: ${stat.count}`);
        console.log(`  Average: ${Math.round(stat.avg)}ms`);
        console.log(`  Min: ${stat.min}ms`);
        console.log(`  Max: ${stat.max}ms`);
        console.log(`  P95: ${stat.p95}ms`);
      }
    });
  });
});
