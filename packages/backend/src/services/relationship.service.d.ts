/**
 * Repository Relationship Service
 * Provides advanced relationship analysis and visualization data
 */
import { IndexSystem } from '../core/IndexSystem.js';
export interface RelationshipGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
}
export interface GraphNode {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'mobile' | 'library' | 'tool' | 'application';
  size: number;
  complexity: number;
  languages: string[];
  frameworks: string[];
  x?: number;
  y?: number;
}
export interface GraphEdge {
  source: string;
  target: string;
  type: 'similar' | 'complementary' | 'dependency' | 'fork';
  strength: number;
  reason: string;
}
export interface GraphCluster {
  id: string;
  name: string;
  repositories: string[];
  theme: string;
  color: string;
}
export interface IntegrationOpportunity {
  id: string;
  repositories: string[];
  type: 'full-stack' | 'microservices' | 'library-ecosystem' | 'mobile-backend' | 'tool-chain';
  title: string;
  description: string;
  benefits: string[];
  challenges: string[];
  implementationSteps: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  priority: number;
}
export interface RelationshipInsights {
  totalRepositories: number;
  totalRelationships: number;
  strongRelationships: number;
  clusters: number;
  topLanguages: {
    language: string;
    count: number;
  }[];
  topFrameworks: {
    framework: string;
    count: number;
  }[];
  architecturalPatterns: {
    pattern: string;
    count: number;
  }[];
  integrationOpportunities: IntegrationOpportunity[];
}
/**
 * Repository Relationship Service
 */
export declare class RelationshipService {
  private indexSystem;
  constructor(indexSystem?: IndexSystem);
  /**
   * Generates a relationship graph for visualization
   *
   * @param repositoryIds - Optional filter for specific repositories
   * @returns Relationship graph data
   */
  generateRelationshipGraph(repositoryIds?: string[]): Promise<RelationshipGraph>;
  /**
   * Analyzes integration opportunities across repositories
   *
   * @param repositoryIds - Repository IDs to analyze
   * @returns Integration opportunities
   */
  analyzeIntegrationOpportunities(repositoryIds: string[]): Promise<IntegrationOpportunity[]>;
  /**
   * Generates comprehensive relationship insights
   *
   * @param repositoryIds - Optional filter for specific repositories
   * @returns Relationship insights
   */
  generateRelationshipInsights(repositoryIds?: string[]): Promise<RelationshipInsights>;
  /**
   * Determines the type of a repository for visualization
   */
  private determineRepositoryType;
  /**
   * Generates clusters of related repositories
   */
  private generateClusters;
  /**
   * Applies force-directed layout algorithm for graph positioning
   */
  private applyForceDirectedLayout;
  /**
   * Analyzes full-stack integration opportunities
   */
  private analyzeFullStackOpportunities;
  /**
   * Analyzes microservices integration opportunities
   */
  private analyzeMicroservicesOpportunities;
  /**
   * Analyzes library ecosystem opportunities
   */
  private analyzeLibraryEcosystemOpportunities;
  /**
   * Analyzes mobile-backend opportunities
   */
  private analyzeMobileBackendOpportunities;
  /**
   * Analyzes tool-chain opportunities
   */
  private analyzeToolChainOpportunities;
  /**
   * Analyzes architectural patterns across repositories
   */
  private analyzeArchitecturalPatterns;
  /**
   * Finds strongly connected components in the repository graph
   */
  private findStronglyConnectedComponents;
  /**
   * Generates combinations of repositories
   */
  private generateCombinations;
  /**
   * Gets color for language-based clusters
   */
  private getLanguageColor;
  /**
   * Gets color for framework-based clusters
   */
  private getFrameworkColor;
  /**
   * Gets color for numbered clusters
   */
  private getClusterColor;
}
export default RelationshipService;
