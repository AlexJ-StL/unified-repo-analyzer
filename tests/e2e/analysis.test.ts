/**
 * End-to-end tests for repository analysis workflows
 */

import axios from 'axios';
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import {
  createTestRepository,
  PerformanceMonitor,
  startTestServer,
  TEST_REPOSITORIES,
  type TestRepository,
  type TestServer,
  waitForAnalysis,
} from './setup';

describe('Repository Analysis E2E Tests', () => {
  let server: TestServer;
  let testRepos: TestRepository[] = [];
  const perfMonitor = new PerformanceMonitor();

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterAll(async () => {
    await server.stop();
    // Cleanup test repositories
    await Promise.all(testRepos.map((repo) => repo.cleanup()));
  });

  beforeEach(() => {
    testRepos = [];
  });

  describe('Single Repository Analysis', () => {
    test('should analyze JavaScript project successfully', async () => {
      const endTimer = perfMonitor.startTimer('js-analysis');

      const repo = await createTestRepository('js-test', TEST_REPOSITORIES.simpleJavaScript);
      testRepos.push(repo);

      const response = await axios.post(`${server.baseUrl}/api/analyze`, {
        path: repo.path,
        options: {
          mode: 'standard',
          includeLLMAnalysis: false,
          includeTree: true,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('analysisId');

      const analysis = await waitForAnalysis(server.baseUrl, response.data.analysisId);

      expect(analysis.status).toBe('completed');
      expect(analysis.result).toHaveProperty('name', 'js-test');
      expect(analysis.result).toHaveProperty('language', 'JavaScript');
      expect(analysis.result.languages).toContain('JavaScript');
      expect(analysis.result.dependencies.production).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'express' }),
          expect.objectContaining({ name: 'lodash' }),
        ])
      );

      const duration = endTimer();
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });

    test('should analyze React TypeScript project', async () => {
      const endTimer = perfMonitor.startTimer('react-analysis');

      const repo = await createTestRepository('react-test', TEST_REPOSITORIES.reactTypeScript);
      testRepos.push(repo);

      const response = await axios.post(`${server.baseUrl}/api/analyze`, {
        path: repo.path,
        options: {
          mode: 'comprehensive',
          includeLLMAnalysis: false,
          includeTree: true,
        },
      });

      const analysis = await waitForAnalysis(server.baseUrl, response.data.analysisId);

      expect(analysis.result.language).toBe('TypeScript');
      expect(analysis.result.frameworks).toContain('React');
      expect(analysis.result.structure.keyFiles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: expect.stringContaining('App.tsx') }),
          expect.objectContaining({ path: expect.stringContaining('index.tsx') }),
        ])
      );

      endTimer();
    });

    test('should analyze Python project', async () => {
      const repo = await createTestRepository('python-test', TEST_REPOSITORIES.pythonProject);
      testRepos.push(repo);

      const response = await axios.post(`${server.baseUrl}/api/analyze`, {
        path: repo.path,
        options: {
          mode: 'quick',
          includeLLMAnalysis: false,
        },
      });

      const analysis = await waitForAnalysis(server.baseUrl, response.data.analysisId);

      expect(analysis.result.language).toBe('Python');
      expect(analysis.result.dependencies.production).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'flask' }),
          expect.objectContaining({ name: 'requests' }),
        ])
      );
    });

    test('should handle invalid repository path', async () => {
      const response = await axios.post(`${server.baseUrl}/api/analyze`, {
        path: '/nonexistent/path',
        options: { mode: 'quick' },
      });

      const analysis = await waitForAnalysis(server.baseUrl, response.data.analysisId);
      expect(analysis.status).toBe('failed');
      expect(analysis.error).toContain('Path not found');
    });
  });

  describe('Batch Analysis', () => {
    test('should process multiple repositories', async () => {
      const endTimer = perfMonitor.startTimer('batch-analysis');

      // Create multiple test repositories
      const jsRepo = await createTestRepository('batch-js', TEST_REPOSITORIES.simpleJavaScript);
      const reactRepo = await createTestRepository(
        'batch-react',
        TEST_REPOSITORIES.reactTypeScript
      );
      const pythonRepo = await createTestRepository(
        'batch-python',
        TEST_REPOSITORIES.pythonProject
      );

      testRepos.push(jsRepo, reactRepo, pythonRepo);

      const response = await axios.post(`${server.baseUrl}/api/analyze/batch`, {
        paths: [jsRepo.path, reactRepo.path, pythonRepo.path],
        options: {
          mode: 'standard',
          includeLLMAnalysis: false,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('batchId');

      // Wait for batch completion
      let batchResult;
      let retries = 60; // 60 seconds timeout for batch

      while (retries > 0) {
        try {
          const batchResponse = await axios.get(
            `${server.baseUrl}/api/batch/${response.data.batchId}`
          );
          if (batchResponse.data.status === 'completed') {
            batchResult = batchResponse.data;
            break;
          }
          if (batchResponse.data.status === 'failed') {
            throw new Error(`Batch failed: ${batchResponse.data.error}`);
          }
        } catch (error) {
          if (!axios.isAxiosError(error) || error.response?.status !== 404) {
            throw error;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retries--;
      }

      expect(batchResult).toBeDefined();
      expect(batchResult.results).toHaveLength(3);
      expect(batchResult.results.every((r: any) => r.status === 'completed')).toBe(true);

      const duration = endTimer();
      expect(duration).toBeLessThan(30000); // Batch should complete within 30 seconds
    });

    test('should handle partial failures in batch', async () => {
      const jsRepo = await createTestRepository(
        'batch-partial-js',
        TEST_REPOSITORIES.simpleJavaScript
      );
      testRepos.push(jsRepo);

      const response = await axios.post(`${server.baseUrl}/api/analyze/batch`, {
        paths: [jsRepo.path, '/invalid/path'],
        options: { mode: 'quick' },
      });

      // Wait for batch completion
      let batchResult;
      let retries = 30;

      while (retries > 0) {
        try {
          const batchResponse = await axios.get(
            `${server.baseUrl}/api/batch/${response.data.batchId}`
          );
          if (batchResponse.data.status === 'completed') {
            batchResult = batchResponse.data;
            break;
          }
        } catch (error) {
          if (!axios.isAxiosError(error) || error.response?.status !== 404) {
            throw error;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retries--;
      }

      expect(batchResult.results).toHaveLength(2);
      expect(batchResult.results[0].status).toBe('completed');
      expect(batchResult.results[1].status).toBe('failed');
    });
  });

  describe('Export Functionality', () => {
    test('should export analysis in JSON format', async () => {
      const repo = await createTestRepository('export-test', TEST_REPOSITORIES.simpleJavaScript);
      testRepos.push(repo);

      const analyzeResponse = await axios.post(`${server.baseUrl}/api/analyze`, {
        path: repo.path,
        options: { mode: 'standard' },
      });

      const analysis = await waitForAnalysis(server.baseUrl, analyzeResponse.data.analysisId);

      const exportResponse = await axios.post(`${server.baseUrl}/api/export`, {
        analysisId: analysis.id,
        format: 'json',
      });

      expect(exportResponse.status).toBe(200);
      expect(exportResponse.headers['content-type']).toContain('application/json');

      const exportedData = exportResponse.data;
      expect(exportedData).toHaveProperty('name');
      expect(exportedData).toHaveProperty('language');
      expect(exportedData).toHaveProperty('dependencies');
    });

    test('should export analysis in Markdown format', async () => {
      const repo = await createTestRepository('export-md-test', TEST_REPOSITORIES.reactTypeScript);
      testRepos.push(repo);

      const analyzeResponse = await axios.post(`${server.baseUrl}/api/analyze`, {
        path: repo.path,
        options: { mode: 'standard' },
      });

      const analysis = await waitForAnalysis(server.baseUrl, analyzeResponse.data.analysisId);

      const exportResponse = await axios.post(`${server.baseUrl}/api/export`, {
        analysisId: analysis.id,
        format: 'markdown',
      });

      expect(exportResponse.status).toBe(200);
      expect(exportResponse.headers['content-type']).toContain('text/markdown');

      const markdown = exportResponse.data;
      expect(markdown).toContain('# Repository Analysis');
      expect(markdown).toContain('## Overview');
      expect(markdown).toContain('## Dependencies');
    });

    test('should export analysis in HTML format', async () => {
      const repo = await createTestRepository('export-html-test', TEST_REPOSITORIES.pythonProject);
      testRepos.push(repo);

      const analyzeResponse = await axios.post(`${server.baseUrl}/api/analyze`, {
        path: repo.path,
        options: { mode: 'standard' },
      });

      const analysis = await waitForAnalysis(server.baseUrl, analyzeResponse.data.analysisId);

      const exportResponse = await axios.post(`${server.baseUrl}/api/export`, {
        analysisId: analysis.id,
        format: 'html',
      });

      expect(exportResponse.status).toBe(200);
      expect(exportResponse.headers['content-type']).toContain('text/html');

      const html = exportResponse.data;
      expect(html).toContain('<html');
      expect(html).toContain('<title>Repository Analysis');
      expect(html).toContain('</html>');
    });
  });

  describe('Repository Index and Search', () => {
    test('should index analyzed repositories', async () => {
      const repo = await createTestRepository('index-test', TEST_REPOSITORIES.simpleJavaScript);
      testRepos.push(repo);

      // Analyze repository
      const analyzeResponse = await axios.post(`${server.baseUrl}/api/analyze`, {
        path: repo.path,
        options: { mode: 'standard' },
      });

      await waitForAnalysis(server.baseUrl, analyzeResponse.data.analysisId);

      // Check if repository appears in index
      const indexResponse = await axios.get(`${server.baseUrl}/api/repositories`);
      expect(indexResponse.status).toBe(200);

      const repositories = indexResponse.data;
      expect(repositories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'index-test',
            languages: expect.arrayContaining(['JavaScript']),
          }),
        ])
      );
    });

    test('should search repositories by language', async () => {
      const searchResponse = await axios.get(`${server.baseUrl}/api/repositories/search`, {
        params: { languages: 'JavaScript' },
      });

      expect(searchResponse.status).toBe(200);
      expect(Array.isArray(searchResponse.data)).toBe(true);

      if (searchResponse.data.length > 0) {
        expect(
          searchResponse.data.every((repo: any) => repo.languages.includes('JavaScript'))
        ).toBe(true);
      }
    });

    test('should search repositories by framework', async () => {
      // First ensure we have a React project indexed
      const repo = await createTestRepository('search-react', TEST_REPOSITORIES.reactTypeScript);
      testRepos.push(repo);

      const analyzeResponse = await axios.post(`${server.baseUrl}/api/analyze`, {
        path: repo.path,
        options: { mode: 'standard' },
      });

      await waitForAnalysis(server.baseUrl, analyzeResponse.data.analysisId);

      const searchResponse = await axios.get(`${server.baseUrl}/api/repositories/search`, {
        params: { frameworks: 'React' },
      });

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            frameworks: expect.arrayContaining(['React']),
          }),
        ])
      );
    });
  });

  describe('Performance Tests', () => {
    test('should handle large repository efficiently', async () => {
      // Create a larger test repository
      const largeRepoFiles: Record<string, string> = {
        'package.json': JSON.stringify({
          name: 'large-test-project',
          dependencies: {},
        }),
        'README.md': '# Large Test Project',
      };

      // Generate multiple files
      for (let i = 0; i < 50; i++) {
        largeRepoFiles[`src/component${i}.js`] = `
          export default function Component${i}() {
            return <div>Component ${i}</div>;
          }
        `;
        largeRepoFiles[`src/utils/util${i}.js`] = `
          export function util${i}() {
            return 'utility function ${i}';
          }
        `;
      }

      const endTimer = perfMonitor.startTimer('large-repo-analysis');

      const repo = await createTestRepository('large-repo', largeRepoFiles);
      testRepos.push(repo);

      const response = await axios.post(`${server.baseUrl}/api/analyze`, {
        path: repo.path,
        options: {
          mode: 'standard',
          maxFiles: 100,
          includeLLMAnalysis: false,
        },
      });

      const analysis = await waitForAnalysis(server.baseUrl, response.data.analysisId, 60000);

      expect(analysis.status).toBe('completed');
      expect(analysis.result.fileCount).toBeGreaterThan(50);

      const duration = endTimer();
      expect(duration).toBeLessThan(60000); // Should complete within 60 seconds
    });

    test('should handle concurrent analysis requests', async () => {
      const endTimer = perfMonitor.startTimer('concurrent-analysis');

      // Create multiple repositories
      const repos = await Promise.all([
        createTestRepository('concurrent-1', TEST_REPOSITORIES.simpleJavaScript),
        createTestRepository('concurrent-2', TEST_REPOSITORIES.reactTypeScript),
        createTestRepository('concurrent-3', TEST_REPOSITORIES.pythonProject),
      ]);

      testRepos.push(...repos);

      // Start analyses concurrently
      const analysisPromises = repos.map((repo) =>
        axios.post(`${server.baseUrl}/api/analyze`, {
          path: repo.path,
          options: { mode: 'quick' },
        })
      );

      const responses = await Promise.all(analysisPromises);

      // Wait for all analyses to complete
      const analyses = await Promise.all(
        responses.map((response) => waitForAnalysis(server.baseUrl, response.data.analysisId))
      );

      expect(analyses.every((analysis) => analysis.status === 'completed')).toBe(true);

      const duration = endTimer();
      expect(duration).toBeLessThan(30000); // Concurrent processing should be efficient
    });
  });

  afterAll(() => {
    // Log performance statistics
    console.log('\n=== Performance Statistics ===');
    const stats = perfMonitor.getAllStats();
    Object.entries(stats).forEach(([name, stat]) => {
      if (stat) {
        console.log(`${name}:`);
        console.log(`  Count: ${stat.count}`);
        console.log(`  Average: ${stat.avg}ms`);
        console.log(`  Min: ${stat.min}ms`);
        console.log(`  Max: ${stat.max}ms`);
        console.log(`  P95: ${stat.p95}ms`);
      }
    });
  });
});
