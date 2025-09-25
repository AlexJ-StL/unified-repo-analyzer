/**
 * Performance tests for large repository processing
 */

import { join } from 'node:path';
import axios from 'axios';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import {
  createTestRepository,
  PerformanceMonitor,
  startTestServer,
  type TestRepository,
  type TestServer,
  waitForAnalysis,
} from './setup';
import type { BatchResult } from './types';

describe('Performance Tests', () => {
  let server: TestServer;
  const testRepos: (TestRepository | Promise<TestRepository>)[] = [];
  const perfMonitor = new PerformanceMonitor();

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterAll(async () => {
    await server.stop();
    await Promise.all(
      testRepos.map((repo) => {
        if (repo instanceof Promise) {
          return repo.then((r) => r.cleanup());
        }
        return repo.cleanup();
      })
    );

    // Log performance statistics
    console.log('\n=== Performance Test Results ===');
    const stats = perfMonitor.getAllStats();
    Object.entries(stats).forEach(([name, stat]) => {
      if (stat) {
        console.log(`\n${name}:`);
        console.log(`  Executions: ${stat.count}`);
        console.log(`  Average: ${Math.round(stat.avg)}ms`);
        console.log(`  Min: ${stat.min}ms`);
        console.log(`  Max: ${stat.max}ms`);
        console.log(`  95th percentile: ${stat.p95}ms`);
      }
    });
  });

  describe('Large Repository Processing', () => {
    test('should handle repository with 1000+ files', async () => {
      const endTimer = perfMonitor.startTimer('1000-files');

      // Generate a large repository structure
      const files: Record<string, string> = {
        'package.json': JSON.stringify({
          name: 'large-monorepo',
          workspaces: ['packages/*'],
          dependencies: {
            react: '^18.0.0',
            typescript: '^5.0.0',
            express: '^4.18.0',
          },
        }),
        'README.md': '# Large Monorepo\n\nA test repository with many files.',
        'tsconfig.json': JSON.stringify({
          compilerOptions: {
            target: 'es2020',
            module: 'commonjs',
            strict: true,
          },
        }),
      };

      // Generate multiple packages
      for (let pkg = 0; pkg < 10; pkg++) {
        files[`packages/package-${pkg}/package.json`] = JSON.stringify({
          name: `package-${pkg}`,
          version: '1.0.0',
          dependencies: {
            lodash: '^4.17.21',
          },
        });

        // Generate files within each package
        for (let i = 0; i < 100; i++) {
          files[`packages/package-${pkg}/src/component-${i}.tsx`] = `
import React from 'react';
import { debounce } from 'lodash';

interface Component${i}Props {
  title: string;
  onClick: () => void;
}

export const Component${i}: React.FC<Component${i}Props> = ({ title, onClick }) => {
  const debouncedClick = debounce(onClick, 300);

  return (
    <div className="component-${i}">
      <h2>{title}</h2>
      <button onClick={debouncedClick}>Click me</button>
    </div>
  );
};

export default Component${i};
`;

          files[`packages/package-${pkg}/src/utils-${i}.ts`] = `
export interface DataModel${i} {
  id: number;
  name: string;
  value: string;
  timestamp: Date;
}

export class Service${i} {
  private data: DataModel${i}[] = [];

  async fetchData(): Promise<DataModel${i}[]> {
    // Simulate API call
    return new Promise(resolve => {
      setTimeout(() => resolve(this.data), 100);
    });
  }

  async saveData(item: DataModel${i}): Promise<void> {
    this.data.push(item);
  }

  processData(items: DataModel${i}[]): DataModel${i}[] {
    return items.filter(item => item.value.length > 0)
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

export const helper${i} = {
  formatDate: (date: Date): string => date.toISOString(),
  validateData: (data: DataModel${i}): boolean => {
    return data.id > 0 && data.name.length > 0;
  }
};
`;
        }

        // Add test files
        files[`packages/package-${pkg}/src/__tests__/component-${pkg}.test.tsx`] = `
import { render, screen } from '@testing-library/react';
import Component${pkg} from '../component-${pkg}';

describe('Component${pkg}', () => {
  test('renders correctly', () => {
    render(<Component${pkg} title="Test" onClick={() => {}} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
`;
      }

      const repo = createTestRepository('large-repo-1000', files);
      // void (async () => { await repo; })(); // This line is effectively a no-op, repo is implicitly awaited by push and access
      testRepos.push(repo as Promise<TestRepository>);

      const response = await axios.post(`${server.baseUrl}/api/analyze`, {
        path: (await repo).path,
        options: {
          mode: 'standard',
          maxFiles: 1500,
          maxLinesPerFile: 1000,
          includeLLMAnalysis: false,
          includeTree: false, // Skip tree generation for performance
        },
      });

      const analysis = await waitForAnalysis(server.baseUrl, response.data.analysisId, 120000); // 2 minute timeout

      expect(analysis.status).toBe('completed');
      expect(analysis.result.fileCount).toBeGreaterThan(1000);
      expect(analysis.result.languages).toContain('TypeScript');
      expect(analysis.result.frameworks).toContain('React');

      const duration = endTimer();
      expect(duration).toBeLessThan(120000); // Should complete within 2 minutes

      // Performance assertions
      expect(analysis.result.metadata.processingTime).toBeLessThan(120000);
      console.log(`Large repo (1000+ files) processed in ${duration}ms`);
    });

    test('should handle repository with deep directory structure', async () => {
      const endTimer = perfMonitor.startTimer('deep-structure');

      const files: Record<string, string> = {
        'package.json': JSON.stringify({
          name: 'deep-structure-repo',
          dependencies: { express: '^4.18.0' },
        }),
      };

      // Create deep nested structure (10 levels deep)
      let currentPath = 'src';
      for (let depth = 0; depth < 10; depth++) {
        currentPath = join(currentPath, `level-${depth}`);

        for (let file = 0; file < 5; file++) {
          files[`${currentPath}/module-${file}.js`] = `
const express = require('express');

class Module${depth}${file} {
  constructor() {
    this.app = express();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.get('/level-${depth}/module-${file}', (req, res) => {
      res.json({ 
        level: ${depth}, 
        module: ${file},
        message: 'Deep structure test'
      });
    });
  }

  start() {
    this.app.listen(300${depth}, () => {
      console.log('Module ${depth}-${file} running on port 300${depth}');
    });
  }
}

module.exports = Module${depth}${file};
`;
        }
      }

      const repo = createTestRepository('deep-structure', files);
      testRepos.push(repo as Promise<TestRepository>);

      const response = await axios.post(`${server.baseUrl}/api/analyze`, {
        path: (await repo).path,
        options: {
          mode: 'comprehensive',
          includeLLMAnalysis: false,
        },
      });

      const analysis = await waitForAnalysis(server.baseUrl, response.data.analysisId, 60000);

      expect(analysis.status).toBe('completed');
      expect(analysis.result.directoryCount).toBeGreaterThan(10);

      const duration = endTimer();
      expect(duration).toBeLessThan(60000);

      console.log(`Deep structure repo processed in ${duration}ms`);
    });

    test('should handle repository with large files', async () => {
      const endTimer = perfMonitor.startTimer('large-files');

      // Generate large file content
      const generateLargeFile = (size: number): string => {
        const baseContent = `
function processData(data) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].isValid) {
      result.push(transformData(data[i]));
    }
  }
  return result;
}

function transformData(item) {
  return {
    id: item.id,
    name: item.name.toUpperCase(),
    value: item.value * 2,
    timestamp: new Date().toISOString()
  };
}
`;

        let content = '';
        const iterations = Math.ceil(size / baseContent.length);
        for (let i = 0; i < iterations; i++) {
          content += baseContent.replace(/processData/g, `processData${i}`);
        }
        return content;
      };

      const files: Record<string, string> = {
        'package.json': JSON.stringify({
          name: 'large-files-repo',
          dependencies: { lodash: '^4.17.21' },
        }),
        'large-file-1.js': generateLargeFile(50000), // ~50KB
        'large-file-2.js': generateLargeFile(100000), // ~100KB
        'large-file-3.js': generateLargeFile(200000), // ~200KB
        'README.md':
          '# Large Files Repository\n\nTesting analysis of repositories with large files.',
      };

      const repo = createTestRepository('large-files', files);
      testRepos.push(repo as Promise<TestRepository>);

      const response = await axios.post(`${server.baseUrl}/api/analyze`, {
        path: (await repo).path,
        options: {
          mode: 'standard',
          maxLinesPerFile: 10000, // Limit lines per file for performance
          includeLLMAnalysis: false,
        },
      });

      const analysis = await waitForAnalysis(server.baseUrl, response.data.analysisId, 60000);

      expect(analysis.status).toBe('completed');
      expect(analysis.result.totalSize).toBeGreaterThan(300000); // Should be > 300KB

      const duration = endTimer();
      expect(duration).toBeLessThan(60000);

      console.log(`Large files repo processed in ${duration}ms`);
    });
  });

  describe('Concurrent Processing Performance', () => {
    test('should handle 10 concurrent analysis requests efficiently', async () => {
      const endTimer = perfMonitor.startTimer('10-concurrent');

      // Create 10 different repositories
      const repoPromises: Promise<TestRepository>[] = [];
      for (let i = 0; i < 10; i++) {
        const files: Record<string, string> = {
          'package.json': JSON.stringify({
            name: `concurrent-repo-${i}`,
            dependencies: {
              express: '^4.18.0',
              lodash: '^4.17.21',
            },
          }),
          [`app-${i}.js`]: `
const express = require('express');
const _ = require('lodash');

const app${i} = express();

app${i}.get('/', (req, res) => {
  res.json({
    message: 'Hello from app ${i}',
    data: _.range(1, 100)
  });
});

app${i}.listen(300${i}, () => {
  console.log('App ${i} running on port 300${i}');
});

module.exports = app${i};
`,
        };

        repoPromises.push(createTestRepository(`concurrent-${i}`, files));
      }

      const repos = await Promise.all(repoPromises);
      testRepos.push(...repos.map((r) => r as TestRepository));

      // Start all analyses concurrently
      const analysisPromises = repos.map((repo) =>
        axios.post(`${server.baseUrl}/api/analyze`, {
          path: repo.path,
          options: {
            mode: 'quick',
            includeLLMAnalysis: false,
          },
        })
      );

      const responses = await Promise.all(analysisPromises);

      // Wait for all to complete
      const analyses = await Promise.all(
        responses.map((response) =>
          waitForAnalysis(server.baseUrl, response.data.analysisId, 30000)
        )
      );

      expect(analyses.every((analysis) => analysis.status === 'completed')).toBe(true);

      const duration = endTimer();
      expect(duration).toBeLessThan(45000); // Should complete within 45 seconds

      console.log(`10 concurrent analyses completed in ${duration}ms`);
    });

    test('should handle batch processing of 20 repositories', async () => {
      const endTimer = perfMonitor.startTimer('batch-20');

      // Create 20 repositories for batch processing
      const repoPromises: Promise<TestRepository>[] = [];
      for (let i = 0; i < 20; i++) {
        const files: Record<string, string> = {
          'package.json': JSON.stringify({
            name: `batch-repo-${i}`,
            dependencies: {
              react: '^18.0.0',
            },
          }),
          [`component-${i}.jsx`]: `
import React from 'react';

export default function Component${i}() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <h1>Component ${i}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
`,
        };

        repoPromises.push(createTestRepository(`batch-${i}`, files));
      }

      const repos = await Promise.all(repoPromises);
      testRepos.push(...repos.map((r) => r as TestRepository));

      const response = await axios.post(`${server.baseUrl}/api/analyze/batch`, {
        paths: repos.map((repo) => repo.path),
        options: {
          mode: 'quick',
          includeLLMAnalysis: false,
        },
      });

      // Wait for batch completion
      let batchResult: BatchResult | undefined;
      let retries = 120; // 2 minute timeout

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

      expect(batchResult).toBeDefined();
      expect(batchResult?.results).toHaveLength(20);
      expect(batchResult?.results.every((r) => r.status === 'completed')).toBe(true);

      const duration = endTimer();
      expect(duration).toBeLessThan(120000); // Should complete within 2 minutes

      console.log(`Batch of 20 repositories processed in ${duration}ms`);
    });
  });

  describe('Memory and Resource Usage', () => {
    test('should not exceed memory limits during large repository analysis', async () => {
      const initialMemory = process.memoryUsage();

      // Create a memory-intensive repository
      const files: Record<string, string> = {
        'package.json': JSON.stringify({
          name: 'memory-test-repo',
          dependencies: {},
        }),
      };

      // Generate many files with substantial content
      for (let i = 0; i < 200; i++) {
        files[`src/module-${i}.js`] = `
// Large module ${i} with substantial content
const data${i} = ${JSON.stringify(
          Array.from({ length: 1000 }, (_, j) => ({
            id: j,
            name: `item-${j}`,
            value: Math.random(),
            nested: {
              prop1: `value-${j}`,
              prop2: Array.from({ length: 10 }, (_, k) => `nested-${k}`),
            },
          }))
        )};

class Module${i} {
  constructor() {
    this.data = data${i};
    this.processed = false;
  }

  process() {
    this.data = this.data.map(item => ({
      ...item,
      processed: true,
      timestamp: new Date().toISOString()
    }));
    this.processed = true;
    return this.data;
  }

  filter(predicate) {
    return this.data.filter(predicate);
  }

  sort(compareFn) {
    return [...this.data].sort(compareFn);
  }
}

module.exports = Module${i};
`;
      }

      const repo = await createTestRepository('memory-test', files);
      testRepos.push(repo);

      const response = await axios.post(`${server.baseUrl}/api/analyze`, {
        path: repo.path,
        options: {
          mode: 'standard',
          maxFiles: 250,
          includeLLMAnalysis: false,
        },
      });

      const analysis = await waitForAnalysis(server.baseUrl, response.data.analysisId, 90000);

      expect(analysis.status).toBe('completed');

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 500MB)
      expect(memoryIncrease).toBeLessThan(500 * 1024 * 1024);

      console.log(`Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
    });
  });
});
