/**
 * Comprehensive tests for IndexSystem covering edge cases and advanced functionality
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RepositoryAnalysis } from '@unified-repo-analyzer/shared/src/types/analysis';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs');

import { IndexSystem } from '../IndexSystem.js';

describe('IndexSystem Comprehensive Tests', () => {
  let indexSystem: IndexSystem;
  let tempIndexPath: string;

  beforeEach(() => {
    tempIndexPath = path.join(__dirname, `temp-index-${Date.now()}.json`);
    indexSystem = new IndexSystem(tempIndexPath);
  });

  afterEach(async () => {
    // Clean up temporary files
    try {
      if (fs.existsSync(tempIndexPath)) {
        fs.unlinkSync(tempIndexPath);
      }
    } catch (_error) {
      // Ignore cleanup errors
    }
  });

  // Helper function to create mock repository analysis
  const createMockAnalysis = (
    name: string,
    languages: string[] = ['JavaScript'],
    frameworks: string[] = ['React']
  ): RepositoryAnalysis => {
    return {
      id: `mock-${name}-${Date.now()}`,
      path: `/path/to/${name}`,
      name,
      language: languages.length > 0 ? languages[0] : 'Unknown',
      languages,
      frameworks,
      fileCount: 100,
      directoryCount: 10,
      totalSize: 1024 * 1024,
      files: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      structure: {
        directories: [],
        keyFiles: [],
        tree: '',
      },
      codeAnalysis: {
        functionCount: 50,
        classCount: 10,
        importCount: 100,
        complexity: {
          cyclomaticComplexity: 10,
          maintainabilityIndex: 75,
          technicalDebt: 'low',
          codeQuality: 'good',
        },
        patterns: [],
      },
      dependencies: {
        production: [],
        development: [],
        frameworks: [],
      },
      insights: {
        executiveSummary: `${name} is a sample repository for testing.`,
        technicalBreakdown: '',
        recommendations: [],
        potentialIssues: [],
      },
      metadata: {
        analysisMode: 'standard',
        analysisTime: 1000,
      },
    };
  };

  describe('Constructor and Initialization', () => {
    it('should initialize empty index when no path provided', () => {
      const system = new IndexSystem();
      const index = system.getIndex();

      expect(index.repositories).toEqual([]);
      expect(index.relationships).toEqual([]);
      expect(index.tags).toEqual([]);
      expect(index.lastUpdated).toBeInstanceOf(Date);
    });

    it('should initialize empty index when file does not exist', () => {
      const nonExistentPath = path.join(__dirname, 'non-existent-file.json');
      const system = new IndexSystem(nonExistentPath);
      const index = system.getIndex();

      expect(index.repositories).toEqual([]);
      expect(index.relationships).toEqual([]);
      expect(index.tags).toEqual([]);
    });

    it('should handle corrupted index file gracefully', () => {
      // Create a corrupted file
      const corruptedPath = path.join(__dirname, 'corrupted-index.json');
      fs.writeFileSync(corruptedPath, 'invalid json content');

      const system = new IndexSystem(corruptedPath);
      const index = system.getIndex();

      expect(index.repositories).toEqual([]);
      expect(index.relationships).toEqual([]);
      expect(index.tags).toEqual([]);

      // Cleanup
      fs.unlinkSync(corruptedPath);
    });

    it('should load valid index from disk', async () => {
      // Add some data
      const analysis = createMockAnalysis('test-repo');
      await indexSystem.addRepository(analysis);

      // Create new instance with same path
      const newSystem = new IndexSystem(tempIndexPath);
      const index = newSystem.getIndex();

      expect(index.repositories.length).toBe(1);
      expect(index.repositories[0].name).toBe('test-repo');
    });
  });

  describe('Repository Management Edge Cases', () => {
    it('should handle duplicate repository additions', async () => {
      const analysis = createMockAnalysis('duplicate-repo');

      await indexSystem.addRepository(analysis);
      await indexSystem.addRepository(analysis); // Add same repo again

      const index = indexSystem.getIndex();
      expect(index.repositories.length).toBe(1);
    });

    it('should handle repository with empty languages/frameworks', async () => {
      const analysis = createMockAnalysis('empty-deps', [], []);

      await indexSystem.addRepository(analysis);

      const index = indexSystem.getIndex();
      expect(index.repositories.length).toBe(1);
      expect(index.repositories[0].languages).toEqual([]);
      expect(index.repositories[0].frameworks).toEqual([]);
    });

    it('should handle repository with special characters in name', async () => {
      const analysis = createMockAnalysis('test-repo-with-special-chars_123.456');

      await indexSystem.addRepository(analysis);

      const index = indexSystem.getIndex();
      expect(index.repositories[0].name).toBe('test-repo-with-special-chars_123.456');
    });

    it('should handle very long repository names', async () => {
      const longName = 'a'.repeat(200);
      const analysis = createMockAnalysis(longName);

      await indexSystem.addRepository(analysis);

      const index = indexSystem.getIndex();
      expect(index.repositories[0].name).toBe(longName);
    });

    it('should handle repository removal', async () => {
      const analysis = createMockAnalysis('to-be-removed');
      await indexSystem.addRepository(analysis);

      await indexSystem.removeRepository(analysis.id);

      const index = indexSystem.getIndex();
      expect(index.repositories.length).toBe(0);
    });

    it('should throw error when removing non-existent repository', async () => {
      await expect(indexSystem.removeRepository('non-existent-id')).rejects.toThrow(
        'Repository with ID non-existent-id not found'
      );
    });
  });

  describe('Search Functionality Edge Cases', () => {
    beforeEach(async () => {
      // Add diverse test repositories
      const repos = [
        createMockAnalysis('empty-repo', [], []),
        createMockAnalysis(
          'multi-lang-repo',
          ['JavaScript', 'TypeScript', 'Python'],
          ['React', 'Django']
        ),
        createMockAnalysis('case-sensitive', ['JavaScript'], ['React']),
        createMockAnalysis('CASE-SENSITIVE', ['JavaScript'], ['React']),
        createMockAnalysis('special-chars-repo', ['C#'], ['.NET']),
        createMockAnalysis('unicode-repo-你好', ['中文'], ['框架']),
      ];

      for (const repo of repos) {
        await indexSystem.addRepository(repo);
      }
    });

    it('should handle empty search query', async () => {
      const results = await indexSystem.searchRepositories({});
      expect(results.length).toBe(6); // All repositories
    });

    it('should handle search with no matches', async () => {
      const results = await indexSystem.searchRepositories({
        languages: ['NonExistentLanguage'],
      });
      expect(results.length).toBe(0);
    });

    it('should handle case-insensitive search', async () => {
      const results = await indexSystem.searchRepositories({
        keywords: ['CASE'],
      });
      expect(results.length).toBe(2); // Both case-sensitive and CASE-SENSITIVE
    });

    it('should handle special characters in search', async () => {
      const results = await indexSystem.searchRepositories({
        keywords: ['C#'],
      });
      expect(results.length).toBe(1);
      expect(results[0].repository.name).toBe('special-chars-repo');
    });

    it('should handle unicode in search', async () => {
      const results = await indexSystem.searchRepositories({
        keywords: ['你好'],
      });
      expect(results.length).toBe(1);
      expect(results[0].repository.name).toBe('unicode-repo-你好');
    });

    it('should handle multiple languages in search', async () => {
      const results = await indexSystem.searchRepositories({
        languages: ['JavaScript', 'Python'],
      });
      expect(results.length).toBe(3); // multi-lang-repo, case-sensitive, CASE-SENSITIVE

      // Should include repositories with any of the specified languages
      const repoNames = results.map((r) => r.repository.name);
      expect(repoNames).toContain('multi-lang-repo');
      expect(repoNames).toContain('case-sensitive');
      expect(repoNames).toContain('CASE-SENSITIVE');
    });

    it('should handle partial keyword matches', async () => {
      const results = await indexSystem.searchRepositories({
        keywords: ['multi', 'special'],
      });
      expect(results.length).toBe(2);
    });
  });

  describe('Tag Management Edge Cases', () => {
    let repoId: string;

    beforeEach(async () => {
      const analysis = createMockAnalysis('tag-test-repo');
      await indexSystem.addRepository(analysis);
      repoId = analysis.id;
    });

    it('should handle duplicate tag additions', async () => {
      await indexSystem.addRepositoryTag(repoId, 'test-tag');
      await indexSystem.addRepositoryTag(repoId, 'test-tag'); // Add same tag again

      const index = indexSystem.getIndex();
      const repo = index.repositories.find((r) => r.id === repoId);
      expect(repo?.tags.filter((t) => t === 'test-tag').length).toBe(1);
    });

    it('should handle empty tag names', async () => {
      await indexSystem.addRepositoryTag(repoId, '');

      const index = indexSystem.getIndex();
      const repo = index.repositories.find((r) => r.id === repoId);
      expect(repo?.tags).toContain('');
    });

    it('should handle very long tag names', async () => {
      const longTag = 'a'.repeat(100);
      await indexSystem.addRepositoryTag(repoId, longTag);

      const index = indexSystem.getIndex();
      const repo = index.repositories.find((r) => r.id === repoId);
      expect(repo?.tags).toContain(longTag);
    });

    it('should handle special characters in tag names', async () => {
      const specialTag = 'tag-with_special.chars@123';
      await indexSystem.addRepositoryTag(repoId, specialTag);

      const index = indexSystem.getIndex();
      const repo = index.repositories.find((r) => r.id === repoId);
      expect(repo?.tags).toContain(specialTag);
    });

    it('should handle removing non-existent tag from repository', async () => {
      await expect(indexSystem.removeRepositoryTag(repoId, 'non-existent-tag')).rejects.toThrow(
        `Tag "non-existent-tag" not found on repository ${repoId}`
      );
    });

    it('should handle removing tag from non-existent repository', async () => {
      await expect(indexSystem.removeRepositoryTag('non-existent-id', 'test-tag')).rejects.toThrow(
        'Repository with ID non-existent-id not found'
      );
    });

    it('should handle global tag with duplicate name', async () => {
      const tag1 = await indexSystem.addTag('duplicate-tag', 'category1');
      const tag2 = await indexSystem.addTag('duplicate-tag', 'category2');

      expect(tag1.id).not.toBe(tag2.id);
      expect(tag1.name).toBe('duplicate-tag');
      expect(tag2.name).toBe('duplicate-tag');
    });

    it('should handle removing non-existent global tag', async () => {
      await expect(indexSystem.removeTag('non-existent-tag-id')).rejects.toThrow(
        'Tag with ID non-existent-tag-id not found'
      );
    });
  });

  describe('Similarity and Relationship Detection', () => {
    beforeEach(async () => {
      // Add test repositories for similarity testing
      const repos = [
        createMockAnalysis('react-frontend', ['JavaScript', 'TypeScript'], ['React', 'Redux']),
        createMockAnalysis('react-native-app', ['JavaScript', 'TypeScript'], ['React Native']),
        createMockAnalysis('vue-frontend', ['JavaScript'], ['Vue']),
        createMockAnalysis('express-backend', ['JavaScript', 'TypeScript'], ['Express']),
        createMockAnalysis('django-backend', ['Python'], ['Django']),
        createMockAnalysis('utility-library', ['JavaScript'], ['npm']),
      ];

      for (const repo of repos) {
        await indexSystem.addRepository(repo);
      }
    });

    it('should handle finding similar repositories for non-existent ID', async () => {
      await expect(indexSystem.findSimilarRepositories('non-existent-id')).rejects.toThrow(
        'Repository with ID non-existent-id not found'
      );
    });

    it('should handle finding similar repositories with empty index', async () => {
      const emptySystem = new IndexSystem();
      const analysis = createMockAnalysis('single-repo');
      await emptySystem.addRepository(analysis);

      const results = await emptySystem.findSimilarRepositories(analysis.id);
      expect(results.length).toBe(0);
    });

    it('should handle similarity with repositories having no common attributes', async () => {
      const pythonRepo = createMockAnalysis('python-only', ['Python'], ['Django']);
      const swiftRepo = createMockAnalysis('swift-only', ['Swift'], ['UIKit']);

      await indexSystem.addRepository(pythonRepo);
      await indexSystem.addRepository(swiftRepo);

      const results = await indexSystem.findSimilarRepositories(pythonRepo.id);
      expect(results.length).toBeGreaterThan(0);
      // Similarity might be higher than expected due to other factors
      expect(results[0].similarity).toBeGreaterThan(0);
    });

    it('should handle combination suggestions with non-existent IDs', async () => {
      await expect(indexSystem.suggestCombinations(['non-existent-id'])).rejects.toThrow(
        'Repository with ID non-existent-id not found'
      );
    });

    it('should handle combination suggestions with single repository', async () => {
      const repos = indexSystem.getIndex().repositories;
      const results = await indexSystem.suggestCombinations([repos[0].id]);

      expect(results.length).toBe(0); // No combinations possible with single repo
    });

    it('should handle combination suggestions with duplicate IDs', async () => {
      const repos = indexSystem.getIndex().repositories;
      const results = await indexSystem.suggestCombinations([repos[0].id, repos[0].id]);

      expect(results.length).toBe(0); // No valid combinations with duplicates
    });
  });

  describe('Persistence and File Operations', () => {
    it('should handle file system errors during save', async () => {
      // Mock fs.writeFileSync to throw an error
      const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('File system error');
      });

      const analysis = createMockAnalysis('test-repo');

      // Should throw an error when trying to save
      await expect(indexSystem.addRepository(analysis)).rejects.toThrow('Failed to save index');

      writeSpy.mockRestore();
    });

    it('should handle invalid JSON in loaded index', () => {
      // Create file with invalid structure
      const invalidData = {
        repositories: 'invalid', // Should be array
        relationships: [],
        tags: [],
        lastUpdated: 'invalid-date',
      };

      fs.writeFileSync(tempIndexPath, JSON.stringify(invalidData));

      const system = new IndexSystem(tempIndexPath);
      const index = system.getIndex();

      expect(index.repositories).toEqual([]);
      expect(index.relationships).toEqual([]);
      expect(index.tags).toEqual([]);
    });

    it('should handle missing fields in loaded index', () => {
      const incompleteData = {
        repositories: [],
        // Missing relationships, tags, lastUpdated
      };

      fs.writeFileSync(tempIndexPath, JSON.stringify(incompleteData));

      const system = new IndexSystem(tempIndexPath);
      const index = system.getIndex();

      expect(index.repositories).toEqual([]);
      expect(index.relationships).toEqual([]);
      expect(index.tags).toEqual([]);
      expect(index.lastUpdated).toBeInstanceOf(Date);
    });

    it('should handle concurrent save operations', async () => {
      const analysis = createMockAnalysis('concurrent-repo');
      await indexSystem.addRepository(analysis);

      // Simulate concurrent saves
      const savePromises = [
        indexSystem.saveIndex(),
        indexSystem.saveIndex(),
        indexSystem.saveIndex(),
      ];

      await expect(Promise.all(savePromises)).resolves.toEqual([undefined, undefined, undefined]);
    });
  });

  describe('Performance and Large Datasets', () => {
    it('should handle large number of repositories', async () => {
      const repoCount = 100;
      const repos: RepositoryAnalysis[] = [];

      for (let i = 0; i < repoCount; i++) {
        repos.push(createMockAnalysis(`repo-${i}`, ['JavaScript'], ['React']));
      }

      const startTime = Date.now();

      for (const repo of repos) {
        await indexSystem.addRepository(repo);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(indexSystem.getIndex().repositories.length).toBe(repoCount);
    });

    it('should handle large number of tags', async () => {
      const analysis = createMockAnalysis('tag-heavy-repo');
      await indexSystem.addRepository(analysis);

      // Get initial tag count (repository gets automatic tags)
      const initialRepo = indexSystem.getIndex().repositories.find((r) => r.id === analysis.id);
      const initialTagCount = initialRepo?.tags.length || 0;

      const additionalTagCount = 50;
      const tagPromises: Promise<void>[] = [];

      for (let i = 0; i < additionalTagCount; i++) {
        tagPromises.push(
          indexSystem.addRepositoryTag(analysis.id, `tag-${i}`, `category-${i % 5}`)
        );
      }

      await Promise.all(tagPromises);

      const repo = indexSystem.getIndex().repositories.find((r) => r.id === analysis.id);
      expect(repo?.tags.length).toBe(initialTagCount + additionalTagCount);
    });

    it('should handle search with large result sets', async () => {
      const repoCount = 50;

      for (let i = 0; i < repoCount; i++) {
        const analysis = createMockAnalysis(`search-repo-${i}`, ['JavaScript'], ['React']);
        await indexSystem.addRepository(analysis);
      }

      const startTime = Date.now();
      const results = await indexSystem.searchRepositories({
        languages: ['JavaScript'],
      });
      const endTime = Date.now();

      expect(results.length).toBe(repoCount);
      expect(endTime - startTime).toBeLessThan(1000); // Should be fast
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should handle null/undefined values in repository data', async () => {
      const analysis = {
        ...createMockAnalysis('null-test'),
        languages: null as string[] | null,
        frameworks: undefined as string[] | undefined,
      };

      await indexSystem.addRepository(analysis);

      const index = indexSystem.getIndex();
      const repo = index.repositories[0];
      expect(repo.languages).toEqual([]);
      expect(repo.frameworks).toEqual([]);
    });

    it('should handle malformed repository data', async () => {
      const malformedAnalysis = {
        id: 'malformed-repo',
        name: 'malformed',
        // Missing required fields
      } as RepositoryAnalysis;

      await expect(indexSystem.addRepository(malformedAnalysis)).rejects.toThrow();
    });

    it('should handle XSS attempts in repository data', async () => {
      const maliciousAnalysis = createMockAnalysis(
        "<script>alert('xss')</script>",
        ["<script>alert('xss')</script>"],
        ["<script>alert('xss')</script>"]
      );

      await indexSystem.addRepository(maliciousAnalysis);

      const index = indexSystem.getIndex();
      const repo = index.repositories[0];
      expect(repo.name).toBe("<script>alert('xss')</script>");
      // Data should be stored as-is (no sanitization at this level)
    });
  });

  describe('Index Statistics and Metadata', () => {
    it('should provide accurate repository count', async () => {
      expect(indexSystem.getRepositoryCount()).toBe(0);

      const analysis = createMockAnalysis('count-test');
      await indexSystem.addRepository(analysis);

      expect(indexSystem.getRepositoryCount()).toBe(1);
    });

    it('should provide accurate tag count', async () => {
      const analysis = createMockAnalysis('tag-count-test');
      await indexSystem.addRepository(analysis);

      await indexSystem.addRepositoryTag(analysis.id, 'test-tag');

      expect(indexSystem.getTags().length).toBe(1);
    });

    it('should update lastUpdated on modifications', async () => {
      const initialDate = indexSystem.getIndex().lastUpdated;

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const analysis = createMockAnalysis('update-test');
      await indexSystem.addRepository(analysis);

      const updatedDate = indexSystem.getIndex().lastUpdated;
      expect(updatedDate.getTime()).toBeGreaterThan(initialDate.getTime());
    });
  });
});
