/**
 * Tests for RelationshipService
 */

/// <reference types="vitest/globals" />
import type { IndexedRepository } from '@unified-repo-analyzer/shared/src/types/repository';
import { vi } from 'vitest';
import { IndexSystem } from '../../core/IndexSystem.js';
import { RelationshipService } from '../relationship.service';

// Mock IndexSystem
vi.mock('../../core/IndexSystem');

describe('RelationshipService', () => {
  let relationshipService: RelationshipService;
  let mockIndexSystem: any;

  beforeEach(() => {
    mockIndexSystem = new IndexSystem() as any;
    relationshipService = new RelationshipService(mockIndexSystem);
  });

  describe('generateRelationshipGraph', () => {
    it('should generate a relationship graph with nodes, edges, and clusters', async () => {
      const mockRepositories: IndexedRepository[] = [
        createMockIndexedRepository('repo-1', 'Frontend App', ['javascript'], ['react']),
        createMockIndexedRepository('repo-2', 'Backend API', ['javascript'], ['express']),
        createMockIndexedRepository('repo-3', 'Mobile App', ['typescript'], ['react-native']),
      ];

      const mockRelationships = [
        {
          sourceId: 'repo-1',
          targetId: 'repo-2',
          type: 'complementary' as const,
          strength: 0.8,
          reason: 'Frontend-Backend complementary pair',
        },
      ];

      mockIndexSystem.getIndex.mockReturnValue({
        repositories: mockRepositories,
        relationships: mockRelationships,
        tags: [],
        lastUpdated: new Date(),
      });

      const graph = await relationshipService.generateRelationshipGraph();

      expect(graph.nodes).toHaveLength(3);
      expect(graph.edges).toHaveLength(1);
      expect(graph.clusters).toBeDefined();

      // Check node properties
      expect(graph.nodes[0]).toMatchObject({
        id: 'repo-1',
        name: 'Frontend App',
        type: 'frontend',
        languages: ['javascript'],
        frameworks: ['react'],
      });

      // Check edge properties
      expect(graph.edges[0]).toMatchObject({
        source: 'repo-1',
        target: 'repo-2',
        type: 'complementary',
        strength: 0.8,
      });
    });

    it('should filter repositories when IDs are provided', async () => {
      const mockRepositories: IndexedRepository[] = [
        createMockIndexedRepository('repo-1', 'Frontend App', ['javascript'], ['react']),
        createMockIndexedRepository('repo-2', 'Backend API', ['javascript'], ['express']),
        createMockIndexedRepository('repo-3', 'Mobile App', ['typescript'], ['react-native']),
      ];

      mockIndexSystem.getIndex.mockReturnValue({
        repositories: mockRepositories,
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });

      const graph = await relationshipService.generateRelationshipGraph(['repo-1', 'repo-2']);

      expect(graph.nodes).toHaveLength(2);
      expect(graph.nodes.map((n) => n.id)).toEqual(['repo-1', 'repo-2']);
    });

    it('should apply force-directed layout positions to nodes', async () => {
      const mockRepositories: IndexedRepository[] = [
        createMockIndexedRepository('repo-1', 'Frontend App', ['javascript'], ['react']),
        createMockIndexedRepository('repo-2', 'Backend API', ['javascript'], ['express']),
      ];

      mockIndexSystem.getIndex.mockReturnValue({
        repositories: mockRepositories,
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });

      const graph = await relationshipService.generateRelationshipGraph();

      // Check that positions are assigned
      graph.nodes.forEach((node) => {
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('analyzeIntegrationOpportunities', () => {
    it('should identify full-stack opportunities', async () => {
      const mockRepositories: IndexedRepository[] = [
        createMockIndexedRepository('frontend', 'React App', ['javascript'], ['react']),
        createMockIndexedRepository('backend', 'Express API', ['javascript'], ['express']),
      ];

      mockIndexSystem.getIndex.mockReturnValue({
        repositories: mockRepositories,
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });

      const opportunities = await relationshipService.analyzeIntegrationOpportunities([
        'frontend',
        'backend',
      ]);

      expect(opportunities.length).toBeGreaterThan(0);

      const fullStackOpportunity = opportunities.find((opp) => opp.type === 'full-stack');
      expect(fullStackOpportunity).toBeDefined();
      expect(fullStackOpportunity?.repositories).toEqual(['frontend', 'backend']);
      expect(fullStackOpportunity?.title).toContain('Full-Stack');
      expect(fullStackOpportunity?.benefits).toContain('Unified development workflow');
    });

    it('should identify microservices opportunities', async () => {
      const mockRepositories: IndexedRepository[] = [
        createMockIndexedRepository('service-1', 'User Service', ['javascript'], ['express']),
        createMockIndexedRepository('service-2', 'Order Service', ['javascript'], ['express']),
      ];

      // Add service indicators to names and tags
      mockRepositories[0].name = 'user-service';
      mockRepositories[0].tags = ['service', 'microservice'];
      mockRepositories[1].name = 'order-service';
      mockRepositories[1].tags = ['service', 'microservice'];

      mockIndexSystem.getIndex.mockReturnValue({
        repositories: mockRepositories,
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });

      const opportunities = await relationshipService.analyzeIntegrationOpportunities([
        'service-1',
        'service-2',
      ]);

      const microservicesOpportunity = opportunities.find((opp) => opp.type === 'microservices');
      expect(microservicesOpportunity).toBeDefined();
      expect(microservicesOpportunity?.title).toContain('Microservices');
      expect(microservicesOpportunity?.benefits).toContain(
        'Scalable and maintainable architecture'
      );
    });

    it('should identify library ecosystem opportunities', async () => {
      const mockRepositories: IndexedRepository[] = [
        createMockIndexedRepository('lib', 'Utility Library', ['javascript'], ['npm']),
        createMockIndexedRepository('app', 'Web Application', ['javascript'], ['react']),
      ];

      // Make the first repo look like a library
      mockRepositories[0].name = 'utility-lib';
      mockRepositories[0].tags = ['library', 'utility'];
      mockRepositories[0].size = 200000; // Smaller size typical of libraries

      mockIndexSystem.getIndex.mockReturnValue({
        repositories: mockRepositories,
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });

      const opportunities = await relationshipService.analyzeIntegrationOpportunities([
        'lib',
        'app',
      ]);

      const libraryOpportunity = opportunities.find((opp) => opp.type === 'library-ecosystem');
      expect(libraryOpportunity).toBeDefined();
      expect(libraryOpportunity?.title).toContain('Library Ecosystem');
      expect(libraryOpportunity?.benefits).toContain('Code reusability and consistency');
    });

    it('should identify mobile-backend opportunities', async () => {
      const mockRepositories: IndexedRepository[] = [
        createMockIndexedRepository('mobile', 'iOS App', ['swift'], ['uikit']),
        createMockIndexedRepository('backend', 'API Server', ['javascript'], ['express']),
      ];

      mockIndexSystem.getIndex.mockReturnValue({
        repositories: mockRepositories,
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });

      const opportunities = await relationshipService.analyzeIntegrationOpportunities([
        'mobile',
        'backend',
      ]);

      const mobileOpportunity = opportunities.find((opp) => opp.type === 'mobile-backend');
      expect(mobileOpportunity).toBeDefined();
      expect(mobileOpportunity?.title).toContain('Mobile Application');
      expect(mobileOpportunity?.benefits).toContain('Native mobile experience');
    });

    it('should sort opportunities by priority', async () => {
      const mockRepositories: IndexedRepository[] = [
        createMockIndexedRepository('frontend', 'React App', ['javascript'], ['react']),
        createMockIndexedRepository('backend', 'Express API', ['javascript'], ['express']),
        createMockIndexedRepository('mobile', 'React Native App', ['javascript'], ['react-native']),
      ];

      mockIndexSystem.getIndex.mockReturnValue({
        repositories: mockRepositories,
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });

      const opportunities = await relationshipService.analyzeIntegrationOpportunities([
        'frontend',
        'backend',
        'mobile',
      ]);

      expect(opportunities.length).toBeGreaterThan(1);

      // Check that opportunities are sorted by priority (descending)
      for (let i = 1; i < opportunities.length; i++) {
        expect(opportunities[i - 1].priority).toBeGreaterThanOrEqual(opportunities[i].priority);
      }
    });
  });

  describe('generateRelationshipInsights', () => {
    it('should generate comprehensive relationship insights', async () => {
      const mockRepositories: IndexedRepository[] = [
        createMockIndexedRepository('repo-1', 'React App', ['javascript', 'typescript'], ['react']),
        createMockIndexedRepository('repo-2', 'Express API', ['javascript'], ['express']),
        createMockIndexedRepository('repo-3', 'Python Service', ['python'], ['django']),
      ];

      const mockRelationships = [
        {
          sourceId: 'repo-1',
          targetId: 'repo-2',
          type: 'complementary' as const,
          strength: 0.8,
          reason: 'Frontend-Backend pair',
        },
        {
          sourceId: 'repo-2',
          targetId: 'repo-3',
          type: 'similar' as const,
          strength: 0.4,
          reason: 'Both are backend services',
        },
      ];

      mockIndexSystem.getIndex.mockReturnValue({
        repositories: mockRepositories,
        relationships: mockRelationships,
        tags: [],
        lastUpdated: new Date(),
      });

      const insights = await relationshipService.generateRelationshipInsights();

      expect(insights.totalRepositories).toBe(3);
      expect(insights.totalRelationships).toBe(2);
      expect(insights.strongRelationships).toBe(1); // Only one relationship > 0.7
      expect(insights.topLanguages).toContainEqual({
        language: 'javascript',
        count: 2,
      });
      expect(insights.topFrameworks).toContainEqual({
        framework: 'react',
        count: 1,
      });
      expect(insights.architecturalPatterns.length).toBeGreaterThanOrEqual(0);
      expect(insights.integrationOpportunities.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter insights by repository IDs when provided', async () => {
      const mockRepositories: IndexedRepository[] = [
        createMockIndexedRepository('repo-1', 'React App', ['javascript'], ['react']),
        createMockIndexedRepository('repo-2', 'Express API', ['javascript'], ['express']),
        createMockIndexedRepository('repo-3', 'Python Service', ['python'], ['django']),
      ];

      mockIndexSystem.getIndex.mockReturnValue({
        repositories: mockRepositories,
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });

      const insights = await relationshipService.generateRelationshipInsights(['repo-1', 'repo-2']);

      expect(insights.totalRepositories).toBe(2);
      expect(insights.topLanguages).toContainEqual({
        language: 'javascript',
        count: 2,
      });
      expect(insights.topLanguages).not.toContainEqual({
        language: 'python',
        count: 1,
      });
    });

    it('should calculate architectural patterns correctly', async () => {
      const mockRepositories: IndexedRepository[] = [
        createMockIndexedRepository('spa-1', 'React SPA', ['javascript'], ['react']),
        createMockIndexedRepository('spa-2', 'Vue SPA', ['javascript'], ['vue']),
        createMockIndexedRepository('api-1', 'REST API', ['javascript'], ['express']),
      ];

      mockIndexSystem.getIndex.mockReturnValue({
        repositories: mockRepositories,
        relationships: [],
        tags: [],
        lastUpdated: new Date(),
      });

      const insights = await relationshipService.generateRelationshipInsights();

      const spaPattern = insights.architecturalPatterns.find(
        (p) => p.pattern === 'SPA (Single Page Application)'
      );
      expect(spaPattern).toBeDefined();
      expect(spaPattern?.count).toBe(2);

      const restPattern = insights.architecturalPatterns.find((p) => p.pattern === 'REST API');
      expect(restPattern).toBeDefined();
      expect(restPattern?.count).toBe(1);
    });
  });
});

// Helper function to create mock indexed repository
function createMockIndexedRepository(
  id: string,
  name: string,
  languages: string[],
  frameworks: string[]
): IndexedRepository {
  return {
    id,
    name,
    path: `/path/to/${id}`,
    languages,
    frameworks,
    tags: [],
    summary: `Mock repository: ${name}`,
    lastAnalyzed: new Date(),
    size: 1000000,
    complexity: 50,
  };
}
