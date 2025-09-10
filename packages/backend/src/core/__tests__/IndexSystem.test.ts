/**
 * Tests for IndexSystem
 */

import type { RepositoryAnalysis } from '@unified-repo-analyzer/shared/src/types/analysis';
import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IndexSystem } from '../IndexSystem.js';

describe('IndexSystem', () => {
  let indexSystem: IndexSystem;
  let tempIndexPath: string;

  beforeEach(() => {
    // Create a temporary path for testing
    tempIndexPath = `${__dirname}/temp-index-${Date.now()}.json`;
    indexSystem = new IndexSystem(tempIndexPath);
  });

  afterEach(async () => {
    // Clean up temporary index file
    try {
      const fs = await import('node:fs');
      if (fs.existsSync(tempIndexPath)) {
        fs.unlinkSync(tempIndexPath);
      }
    } catch (_error) {}
  });

  // Helper function to create mock repository analysis
  const createMockAnalysis = (
    name: string,
    languages: string[] = ['JavaScript'],
    frameworks: string[] = ['React']
  ): RepositoryAnalysis => {
    return {
      id: uuidv4(),
      path: `/path/to/${name}`,
      name,
      language: languages[0],
      languages,
      frameworks,
      fileCount: 100,
      directoryCount: 10,
      totalSize: 1024 * 1024,
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
        processingTime: 1000,
      },
    };
  };

  describe('addRepository', () => {
    it('should add a repository to the index', async () => {
      const analysis = createMockAnalysis('test-repo');
      await indexSystem.addRepository(analysis);

      const index = indexSystem.getIndex();
      expect(index.repositories.length).toBe(1);
      expect(index.repositories[0].name).toBe('test-repo');
      expect(index.repositories[0].id).toBe(analysis.id);
    });

    it('should update existing repository if path matches', async () => {
      const analysis1 = createMockAnalysis('test-repo');
      await indexSystem.addRepository(analysis1);

      const analysis2 = {
        ...analysis1,
        name: 'updated-repo',
      };
      await indexSystem.addRepository(analysis2);

      const index = indexSystem.getIndex();
      expect(index.repositories.length).toBe(1);
      expect(index.repositories[0].name).toBe('updated-repo');
    });
  });

  describe('updateRepository', () => {
    it('should update an existing repository', async () => {
      const analysis = createMockAnalysis('test-repo');
      await indexSystem.addRepository(analysis);

      const updatedAnalysis = {
        ...analysis,
        name: 'updated-repo',
      };
      await indexSystem.updateRepository(analysis.id, updatedAnalysis);

      const index = indexSystem.getIndex();
      expect(index.repositories.length).toBe(1);
      expect(index.repositories[0].name).toBe('updated-repo');
    });

    it('should throw error if repository not found', async () => {
      const analysis = createMockAnalysis('test-repo');
      await expect(indexSystem.updateRepository('non-existent-id', analysis)).rejects.toThrow();
    });
  });

  describe('searchRepositories', () => {
    beforeEach(async () => {
      // Add sample repositories
      await indexSystem.addRepository(
        createMockAnalysis('react-app', ['JavaScript', 'TypeScript'], ['React', 'Redux'])
      );
      await indexSystem.addRepository(createMockAnalysis('vue-app', ['JavaScript'], ['Vue']));
      await indexSystem.addRepository(
        createMockAnalysis('express-api', ['JavaScript', 'TypeScript'], ['Express', 'Node.js'])
      );
      await indexSystem.addRepository(createMockAnalysis('django-api', ['Python'], ['Django']));
    });

    it('should search repositories by language', async () => {
      const results = await indexSystem.searchRepositories({
        languages: ['TypeScript'],
      });

      expect(results.length).toBe(2);
      expect(results[0].repository.name).toMatch(/react-app|express-api/);
      expect(results[1].repository.name).toMatch(/react-app|express-api/);
    });

    it('should search repositories by framework', async () => {
      const results = await indexSystem.searchRepositories({
        frameworks: ['React'],
      });

      expect(results.length).toBe(1);
      expect(results[0].repository.name).toBe('react-app');
    });

    it('should search repositories by keyword', async () => {
      const results = await indexSystem.searchRepositories({
        keywords: ['api'],
      });

      expect(results.length).toBe(2);
      expect(results[0].repository.name).toMatch(/express-api|django-api/);
      expect(results[1].repository.name).toMatch(/express-api|django-api/);
    });

    it('should combine multiple search criteria', async () => {
      const results = await indexSystem.searchRepositories({
        languages: ['JavaScript'],
        frameworks: ['Express'],
      });

      expect(results.length).toBe(1);
      expect(results[0].repository.name).toBe('express-api');
    });
  });

  describe('findSimilarRepositories', () => {
    let repoIds: string[] = [];

    beforeEach(async () => {
      // Add sample repositories
      const repo1 = createMockAnalysis(
        'react-app',
        ['JavaScript', 'TypeScript'],
        ['React', 'Redux']
      );
      const repo2 = createMockAnalysis(
        'react-native-app',
        ['JavaScript', 'TypeScript'],
        ['React', 'React Native']
      );
      const repo3 = createMockAnalysis('vue-app', ['JavaScript'], ['Vue']);
      const repo4 = createMockAnalysis(
        'express-api',
        ['JavaScript', 'TypeScript'],
        ['Express', 'Node.js']
      );

      await indexSystem.addRepository(repo1);
      await indexSystem.addRepository(repo2);
      await indexSystem.addRepository(repo3);
      await indexSystem.addRepository(repo4);

      repoIds = [repo1.id, repo2.id, repo3.id, repo4.id];
    });

    it('should find similar repositories', async () => {
      const results = await indexSystem.findSimilarRepositories(repoIds[0]);

      // React app should be similar to React Native app
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].repository.name).toBe('react-native-app');
    });

    it('should throw error if repository not found', async () => {
      await expect(indexSystem.findSimilarRepositories('non-existent-id')).rejects.toThrow();
    });
  });

  describe('suggestCombinations', () => {
    let repoIds: string[] = [];

    beforeEach(async () => {
      // Add sample repositories
      const repo1 = createMockAnalysis(
        'react-app',
        ['JavaScript', 'TypeScript'],
        ['React', 'Redux']
      );
      const repo2 = createMockAnalysis(
        'express-api',
        ['JavaScript', 'TypeScript'],
        ['Express', 'Node.js']
      );
      const repo3 = createMockAnalysis('vue-app', ['JavaScript'], ['Vue']);
      const repo4 = createMockAnalysis('django-api', ['Python'], ['Django']);

      await indexSystem.addRepository(repo1);
      await indexSystem.addRepository(repo2);
      await indexSystem.addRepository(repo3);
      await indexSystem.addRepository(repo4);

      repoIds = [repo1.id, repo2.id, repo3.id, repo4.id];
    });

    it('should suggest combinations of repositories', async () => {
      const results = await indexSystem.suggestCombinations([repoIds[0], repoIds[1]]);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].repositories).toContain(repoIds[0]);
      expect(results[0].repositories).toContain(repoIds[1]);
    });

    it('should throw error if repository not found', async () => {
      await expect(indexSystem.suggestCombinations(['non-existent-id'])).rejects.toThrow();
    });
  });

  describe('tag management', () => {
    let repoId: string;

    beforeEach(async () => {
      // Add a test repository
      const analysis = createMockAnalysis('test-repo');
      await indexSystem.addRepository(analysis);
      repoId = analysis.id;
    });

    it('should add a tag to a repository', async () => {
      await indexSystem.addRepositoryTag(repoId, 'test-tag', 'test-category', '#ff0000');

      const index = indexSystem.getIndex();
      expect(index.repositories[0].tags).toContain('test-tag');

      // Check that tag was added to global tags
      const tags = indexSystem.getTags();
      const testTag = tags.find((tag) => tag.name === 'test-tag');
      expect(testTag).toBeDefined();
      expect(testTag?.category).toBe('test-category');
      expect(testTag?.color).toBe('#ff0000');
    });

    it('should remove a tag from a repository', async () => {
      // Add tag first
      await indexSystem.addRepositoryTag(repoId, 'test-tag');

      // Then remove it
      await indexSystem.removeRepositoryTag(repoId, 'test-tag');

      const index = indexSystem.getIndex();
      expect(index.repositories[0].tags).not.toContain('test-tag');
    });

    it('should add a global tag', async () => {
      const newTag = await indexSystem.addTag('global-tag', 'global-category', '#00ff00');

      expect(newTag.name).toBe('global-tag');
      expect(newTag.category).toBe('global-category');
      expect(newTag.color).toBe('#00ff00');

      const tags = indexSystem.getTags();
      expect(tags).toContainEqual(
        expect.objectContaining({
          name: 'global-tag',
          category: 'global-category',
          color: '#00ff00',
        })
      );
    });

    it('should remove a global tag and from all repositories', async () => {
      // Add tag to repository
      await indexSystem.addRepositoryTag(repoId, 'global-tag');

      // Get tag ID
      const tags = indexSystem.getTags();
      const tagId = tags.find((tag) => tag.name === 'global-tag')?.id;

      if (!tagId) {
        throw new Error('Tag ID not found');
      }

      // Remove global tag
      await indexSystem.removeTag(tagId);

      // Check that tag was removed from repository
      const index = indexSystem.getIndex();
      expect(index.repositories[0].tags).not.toContain('global-tag');

      // Check that tag was removed from global tags
      const updatedTags = indexSystem.getTags();
      expect(updatedTags.find((tag) => tag.id === tagId)).toBeUndefined();
    });
  });

  describe('persistence', () => {
    it('should save and load index from disk', async () => {
      // Add a repository
      const analysis = createMockAnalysis('persistence-test');
      await indexSystem.addRepository(analysis);

      // Create a new index system with the same path
      const newIndexSystem = new IndexSystem(tempIndexPath);

      // Check that repository was loaded
      const index = newIndexSystem.getIndex();
      expect(index.repositories.length).toBe(1);
      expect(index.repositories[0].name).toBe('persistence-test');
    });
  });
});
