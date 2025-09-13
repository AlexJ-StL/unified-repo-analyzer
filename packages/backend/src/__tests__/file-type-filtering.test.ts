import type { SearchQuery } from '@unified-repo-analyzer/shared/src/types/analysis';
import type { IndexedRepository } from '@unified-repo-analyzer/shared/src/types/repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { IndexSystem, type RepositoryIndex } from '../core/IndexSystem.js';

describe('File Type Filtering', () => {
  let indexSystem: IndexSystem;

  beforeEach(() => {
    indexSystem = new IndexSystem();

    // Set up mock data using public methods
    const mockRepositories: IndexedRepository[] = [
      {
        id: '1',
        name: 'react-app',
        path: '/path/to/react-app',
        languages: ['javascript', 'typescript'],
        frameworks: ['react'],
        tags: ['react', 'javascript', 'typescript', 'frontend', 'jsx', 'tsx'],
        summary: 'A React application',
        lastAnalyzed: new Date(),
        size: 1000,
        complexity: 5,
      },
      {
        id: '2',
        name: 'python-api',
        path: '/path/to/python-api',
        languages: ['python'],
        frameworks: ['django'],
        tags: ['python', 'django', 'backend', 'api', 'py'],
        summary: 'A Python Django API',
        lastAnalyzed: new Date(),
        size: 2000,
        complexity: 7,
      },
      {
        id: '3',
        name: 'node-server',
        path: '/path/to/node-server',
        languages: ['javascript'],
        frameworks: ['express'],
        tags: ['nodejs', 'javascript', 'express', 'backend', 'js'],
        summary: 'A Node.js Express server',
        lastAnalyzed: new Date(),
        size: 1500,
        complexity: 4,
      },
    ];

    // Use reflection to set private property for testing
    (indexSystem as unknown as { index: RepositoryIndex }).index = {
      repositories: mockRepositories,
      relationships: [],
      tags: [],
      lastUpdated: new Date(),
    };
  });

  it('should find repositories with .js files', async () => {
    const query: SearchQuery = { fileTypes: ['.js'] };
    const results = await indexSystem.searchRepositories(query);

    expect(results).toHaveLength(2); // react-app and node-server
    expect(results.map((r) => r.repository.name)).toContain('react-app');
    expect(results.map((r) => r.repository.name)).toContain('node-server');
  });

  it('should find repositories with .ts files', async () => {
    const query: SearchQuery = { fileTypes: ['.ts'] };
    const results = await indexSystem.searchRepositories(query);

    expect(results).toHaveLength(1); // only react-app
    expect(results[0].repository.name).toBe('react-app');
  });

  it('should find repositories with .py files', async () => {
    const query: SearchQuery = { fileTypes: ['.py'] };
    const results = await indexSystem.searchRepositories(query);

    expect(results).toHaveLength(1); // only python-api
    expect(results[0].repository.name).toBe('python-api');
  });

  it('should find repositories with .jsx files', async () => {
    const query: SearchQuery = { fileTypes: ['.jsx'] };
    const results = await indexSystem.searchRepositories(query);

    expect(results).toHaveLength(2); // both react-app and node-server (both support JavaScript)
    expect(results.map((r) => r.repository.name)).toContain('react-app');
    expect(results.map((r) => r.repository.name)).toContain('node-server');
  });

  it('should find repositories with multiple file types', async () => {
    const query: SearchQuery = { fileTypes: ['.js', '.ts'] };
    const results = await indexSystem.searchRepositories(query);

    expect(results).toHaveLength(2); // react-app and node-server
    expect(results.map((r) => r.repository.name)).toContain('react-app');
    expect(results.map((r) => r.repository.name)).toContain('node-server');
  });

  it('should assign correct scores for file type matches', async () => {
    const query: SearchQuery = { fileTypes: ['.js', '.ts'] };
    const results = await indexSystem.searchRepositories(query);

    const reactApp = results.find((r) => r.repository.name === 'react-app');
    expect(reactApp).toBeDefined();
    expect(reactApp?.matches).toContainEqual(
      expect.objectContaining({
        field: 'fileTypes',
        value: '.js, .ts',
      })
    );
    expect(reactApp?.score).toBeGreaterThan(0);
  });
});
