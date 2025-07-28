/**
 * Repository Relationship Service
 * Provides advanced relationship analysis and visualization data
 */

import { IndexSystem } from '../core/IndexSystem';
import {
  IndexedRepository,
  RepositoryRelationship,
} from '@unified-repo-analyzer/shared/src/types/repository';

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
  theme: string; // e.g., 'javascript-ecosystem', 'full-stack-web'
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
  topLanguages: { language: string; count: number }[];
  topFrameworks: { framework: string; count: number }[];
  architecturalPatterns: { pattern: string; count: number }[];
  integrationOpportunities: IntegrationOpportunity[];
}

/**
 * Repository Relationship Service
 */
export class RelationshipService {
  private indexSystem: IndexSystem;

  constructor(indexSystem?: IndexSystem) {
    this.indexSystem = indexSystem || new IndexSystem();
  }

  /**
   * Generates a relationship graph for visualization
   *
   * @param repositoryIds - Optional filter for specific repositories
   * @returns Relationship graph data
   */
  public async generateRelationshipGraph(repositoryIds?: string[]): Promise<RelationshipGraph> {
    const index = this.indexSystem.getIndex();

    // Filter repositories if IDs provided
    const repositories = repositoryIds
      ? index.repositories.filter((repo) => repositoryIds.includes(repo.id))
      : index.repositories;

    // Generate nodes
    const nodes: GraphNode[] = repositories.map((repo) => ({
      id: repo.id,
      name: repo.name,
      type: this.determineRepositoryType(repo),
      size: repo.size,
      complexity: repo.complexity,
      languages: repo.languages,
      frameworks: repo.frameworks,
    }));

    // Generate edges from relationships
    const edges: GraphEdge[] = index.relationships
      .filter(
        (rel) =>
          repositories.some((repo) => repo.id === rel.sourceId) &&
          repositories.some((repo) => repo.id === rel.targetId)
      )
      .map((rel) => ({
        source: rel.sourceId,
        target: rel.targetId,
        type: rel.type,
        strength: rel.strength,
        reason: rel.reason,
      }));

    // Generate clusters
    const clusters = await this.generateClusters(repositories, index.relationships);

    // Apply force-directed layout positions
    const graphWithPositions = this.applyForceDirectedLayout({ nodes, edges, clusters });

    return graphWithPositions;
  }

  /**
   * Analyzes integration opportunities across repositories
   *
   * @param repositoryIds - Repository IDs to analyze
   * @returns Integration opportunities
   */
  public async analyzeIntegrationOpportunities(
    repositoryIds: string[]
  ): Promise<IntegrationOpportunity[]> {
    const index = this.indexSystem.getIndex();
    const repositories = repositoryIds.map((id) => {
      const repo = index.repositories.find((r) => r.id === id);
      if (!repo) {
        throw new Error(`Repository with ID ${id} not found`);
      }
      return repo;
    });

    const opportunities: IntegrationOpportunity[] = [];

    // Analyze full-stack opportunities
    opportunities.push(...(await this.analyzeFullStackOpportunities(repositories)));

    // Analyze microservices opportunities
    opportunities.push(...(await this.analyzeMicroservicesOpportunities(repositories)));

    // Analyze library ecosystem opportunities
    opportunities.push(...(await this.analyzeLibraryEcosystemOpportunities(repositories)));

    // Analyze mobile-backend opportunities
    opportunities.push(...(await this.analyzeMobileBackendOpportunities(repositories)));

    // Analyze tool-chain opportunities
    opportunities.push(...(await this.analyzeToolChainOpportunities(repositories)));

    // Sort by priority and estimated impact
    opportunities.sort((a, b) => b.priority - a.priority);

    return opportunities;
  }

  /**
   * Generates comprehensive relationship insights
   *
   * @param repositoryIds - Optional filter for specific repositories
   * @returns Relationship insights
   */
  public async generateRelationshipInsights(
    repositoryIds?: string[]
  ): Promise<RelationshipInsights> {
    const index = this.indexSystem.getIndex();

    const repositories = repositoryIds
      ? index.repositories.filter((repo) => repositoryIds.includes(repo.id))
      : index.repositories;

    const relationships = index.relationships.filter(
      (rel) =>
        repositories.some((repo) => repo.id === rel.sourceId) &&
        repositories.some((repo) => repo.id === rel.targetId)
    );

    // Calculate language statistics
    const languageCount = new Map<string, number>();
    repositories.forEach((repo) => {
      repo.languages.forEach((lang) => {
        languageCount.set(lang, (languageCount.get(lang) || 0) + 1);
      });
    });

    const topLanguages = Array.from(languageCount.entries())
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate framework statistics
    const frameworkCount = new Map<string, number>();
    repositories.forEach((repo) => {
      repo.frameworks.forEach((fw) => {
        frameworkCount.set(fw, (frameworkCount.get(fw) || 0) + 1);
      });
    });

    const topFrameworks = Array.from(frameworkCount.entries())
      .map(([framework, count]) => ({ framework, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Analyze architectural patterns
    const architecturalPatterns = this.analyzeArchitecturalPatterns(repositories);

    // Generate integration opportunities
    const integrationOpportunities = await this.analyzeIntegrationOpportunities(
      repositories.map((repo) => repo.id)
    );

    // Generate clusters for counting
    const clusters = await this.generateClusters(repositories, relationships);

    return {
      totalRepositories: repositories.length,
      totalRelationships: relationships.length,
      strongRelationships: relationships.filter((rel) => rel.strength > 0.7).length,
      clusters: clusters.length,
      topLanguages,
      topFrameworks,
      architecturalPatterns,
      integrationOpportunities: integrationOpportunities.slice(0, 5), // Top 5 opportunities
    };
  }

  /**
   * Determines the type of a repository for visualization
   */
  private determineRepositoryType(repo: IndexedRepository): GraphNode['type'] {
    // Check for frontend
    if (
      repo.frameworks.some((fw) => ['react', 'vue', 'angular', 'svelte'].includes(fw.toLowerCase()))
    ) {
      return 'frontend';
    }

    // Check for backend
    if (
      repo.frameworks.some((fw) =>
        ['express', 'nest', 'django', 'flask', 'spring'].includes(fw.toLowerCase())
      )
    ) {
      return 'backend';
    }

    // Check for mobile
    if (
      repo.languages.some((lang) => ['swift', 'kotlin', 'dart'].includes(lang.toLowerCase())) ||
      repo.frameworks.some((fw) => ['react-native', 'flutter', 'ionic'].includes(fw.toLowerCase()))
    ) {
      return 'mobile';
    }

    // Check for library
    const libraryKeywords = ['lib', 'library', 'sdk', 'toolkit', 'util', 'helper'];
    if (libraryKeywords.some((keyword) => repo.name.toLowerCase().includes(keyword))) {
      return 'library';
    }

    // Check for tool
    const toolKeywords = ['tool', 'cli', 'script', 'build', 'deploy'];
    if (toolKeywords.some((keyword) => repo.name.toLowerCase().includes(keyword))) {
      return 'tool';
    }

    return 'application';
  }

  /**
   * Generates clusters of related repositories
   */
  private async generateClusters(
    repositories: IndexedRepository[],
    relationships: RepositoryRelationship[]
  ): Promise<GraphCluster[]> {
    const clusters: GraphCluster[] = [];
    const visited = new Set<string>();

    // Language-based clusters
    const languageGroups = new Map<string, IndexedRepository[]>();
    repositories.forEach((repo) => {
      repo.languages.forEach((lang) => {
        if (!languageGroups.has(lang)) {
          languageGroups.set(lang, []);
        }
        languageGroups.get(lang)!.push(repo);
      });
    });

    languageGroups.forEach((repos, language) => {
      if (repos.length >= 2) {
        const clusterRepos = repos.filter((repo) => !visited.has(repo.id));
        if (clusterRepos.length >= 2) {
          clusters.push({
            id: `lang-${language}`,
            name: `${language} Projects`,
            repositories: clusterRepos.map((repo) => repo.id),
            theme: `${language}-ecosystem`,
            color: this.getLanguageColor(language),
          });
          clusterRepos.forEach((repo) => visited.add(repo.id));
        }
      }
    });

    // Framework-based clusters
    const frameworkGroups = new Map<string, IndexedRepository[]>();
    repositories.forEach((repo) => {
      repo.frameworks.forEach((fw) => {
        if (!frameworkGroups.has(fw)) {
          frameworkGroups.set(fw, []);
        }
        frameworkGroups.get(fw)!.push(repo);
      });
    });

    frameworkGroups.forEach((repos, framework) => {
      if (repos.length >= 2) {
        const clusterRepos = repos.filter((repo) => !visited.has(repo.id));
        if (clusterRepos.length >= 2) {
          clusters.push({
            id: `fw-${framework}`,
            name: `${framework} Applications`,
            repositories: clusterRepos.map((repo) => repo.id),
            theme: `${framework}-applications`,
            color: this.getFrameworkColor(framework),
          });
          clusterRepos.forEach((repo) => visited.add(repo.id));
        }
      }
    });

    // Relationship-based clusters (strongly connected components)
    const stronglyConnected = this.findStronglyConnectedComponents(repositories, relationships);
    stronglyConnected.forEach((component, index) => {
      if (component.length >= 2) {
        const clusterRepos = component.filter((repo) => !visited.has(repo.id));
        if (clusterRepos.length >= 2) {
          clusters.push({
            id: `connected-${index}`,
            name: `Connected Group ${index + 1}`,
            repositories: clusterRepos.map((repo) => repo.id),
            theme: 'connected-components',
            color: this.getClusterColor(index),
          });
          clusterRepos.forEach((repo) => visited.add(repo.id));
        }
      }
    });

    return clusters;
  }

  /**
   * Applies force-directed layout algorithm for graph positioning
   */
  private applyForceDirectedLayout(graph: RelationshipGraph): RelationshipGraph {
    const { nodes, edges } = graph;

    // Simple force-directed layout simulation
    const width = 800;
    const height = 600;

    // Initialize random positions
    nodes.forEach((node) => {
      node.x = Math.random() * width;
      node.y = Math.random() * height;
    });

    // Simulate forces for better positioning
    for (let iteration = 0; iteration < 100; iteration++) {
      // Repulsion force between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i];
          const nodeB = nodes[j];

          const dx = nodeB.x! - nodeA.x!;
          const dy = nodeB.y! - nodeA.y!;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          const repulsionForce = 1000 / (distance * distance);
          const fx = (dx / distance) * repulsionForce;
          const fy = (dy / distance) * repulsionForce;

          nodeA.x! -= fx;
          nodeA.y! -= fy;
          nodeB.x! += fx;
          nodeB.y! += fy;
        }
      }

      // Attraction force for connected nodes
      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (sourceNode && targetNode) {
          const dx = targetNode.x! - sourceNode.x!;
          const dy = targetNode.y! - sourceNode.y!;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          const attractionForce = distance * 0.01 * edge.strength;
          const fx = (dx / distance) * attractionForce;
          const fy = (dy / distance) * attractionForce;

          sourceNode.x! += fx;
          sourceNode.y! += fy;
          targetNode.x! -= fx;
          targetNode.y! -= fy;
        }
      });

      // Keep nodes within bounds
      nodes.forEach((node) => {
        node.x = Math.max(50, Math.min(width - 50, node.x!));
        node.y = Math.max(50, Math.min(height - 50, node.y!));
      });
    }

    return graph;
  }

  /**
   * Analyzes full-stack integration opportunities
   */
  private async analyzeFullStackOpportunities(
    repositories: IndexedRepository[]
  ): Promise<IntegrationOpportunity[]> {
    const opportunities: IntegrationOpportunity[] = [];

    const frontendRepos = repositories.filter((repo) =>
      repo.frameworks.some((fw) => ['react', 'vue', 'angular'].includes(fw.toLowerCase()))
    );

    const backendRepos = repositories.filter((repo) =>
      repo.frameworks.some((fw) =>
        ['express', 'nest', 'django', 'flask'].includes(fw.toLowerCase())
      )
    );

    for (const frontend of frontendRepos) {
      for (const backend of backendRepos) {
        if (frontend.id !== backend.id) {
          const sharedLanguages = frontend.languages.filter((lang) =>
            backend.languages.includes(lang)
          );
          const compatibility = sharedLanguages.length > 0 ? 0.8 : 0.6;

          opportunities.push({
            id: `fullstack-${frontend.id}-${backend.id}`,
            repositories: [frontend.id, backend.id],
            type: 'full-stack',
            title: `Full-Stack Application: ${frontend.name} + ${backend.name}`,
            description: `Integrate ${frontend.name} frontend with ${backend.name} backend to create a complete web application.`,
            benefits: [
              'Unified development workflow',
              'Shared data models and validation',
              'Consistent user experience',
              'Simplified deployment pipeline',
            ],
            challenges: [
              'API design and versioning',
              'Authentication and authorization',
              'State management synchronization',
              'Cross-origin resource sharing (CORS)',
            ],
            implementationSteps: [
              'Design RESTful API endpoints',
              'Implement authentication system',
              'Create shared data models',
              'Set up API client in frontend',
              'Implement error handling and loading states',
              'Configure build and deployment pipeline',
            ],
            estimatedEffort: compatibility > 0.7 ? 'medium' : 'high',
            priority: compatibility * 100,
          });
        }
      }
    }

    return opportunities;
  }

  /**
   * Analyzes microservices integration opportunities
   */
  private async analyzeMicroservicesOpportunities(
    repositories: IndexedRepository[]
  ): Promise<IntegrationOpportunity[]> {
    const opportunities: IntegrationOpportunity[] = [];

    const serviceRepos = repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes('service') ||
        repo.tags.some((tag) => tag.toLowerCase().includes('service'))
    );

    if (serviceRepos.length >= 2) {
      const combinations = this.generateCombinations(
        serviceRepos,
        Math.min(serviceRepos.length, 4)
      );

      for (const combination of combinations) {
        if (combination.length >= 2) {
          opportunities.push({
            id: `microservices-${combination.map((r) => r.id).join('-')}`,
            repositories: combination.map((r) => r.id),
            type: 'microservices',
            title: `Microservices Architecture: ${combination.map((r) => r.name).join(' + ')}`,
            description: `Integrate multiple services into a cohesive microservices architecture.`,
            benefits: [
              'Scalable and maintainable architecture',
              'Independent deployment and scaling',
              'Technology diversity support',
              'Fault isolation and resilience',
            ],
            challenges: [
              'Service discovery and communication',
              'Distributed data management',
              'Monitoring and observability',
              'Network latency and reliability',
            ],
            implementationSteps: [
              'Design service boundaries and APIs',
              'Implement service discovery mechanism',
              'Set up inter-service communication',
              'Implement distributed logging and monitoring',
              'Configure load balancing and routing',
              'Establish deployment and orchestration',
            ],
            estimatedEffort: 'high',
            priority: combination.length * 20,
          });
        }
      }
    }

    return opportunities;
  }

  /**
   * Analyzes library ecosystem opportunities
   */
  private async analyzeLibraryEcosystemOpportunities(
    repositories: IndexedRepository[]
  ): Promise<IntegrationOpportunity[]> {
    const opportunities: IntegrationOpportunity[] = [];

    const libraryRepos = repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes('lib') ||
        repo.name.toLowerCase().includes('util') ||
        repo.tags.some((tag) => tag.toLowerCase().includes('library'))
    );

    const applicationRepos = repositories.filter(
      (repo) => !libraryRepos.includes(repo) && (repo.frameworks.length > 0 || repo.size > 1000000)
    );

    if (libraryRepos.length > 0 && applicationRepos.length > 0) {
      for (const app of applicationRepos) {
        const compatibleLibraries = libraryRepos.filter((lib) =>
          lib.languages.some((lang) => app.languages.includes(lang))
        );

        if (compatibleLibraries.length > 0) {
          opportunities.push({
            id: `library-ecosystem-${app.id}-${compatibleLibraries.map((l) => l.id).join('-')}`,
            repositories: [app.id, ...compatibleLibraries.map((l) => l.id)],
            type: 'library-ecosystem',
            title: `Library Ecosystem: ${app.name} with ${compatibleLibraries.length} libraries`,
            description: `Integrate shared libraries with ${app.name} to create a modular ecosystem.`,
            benefits: [
              'Code reusability and consistency',
              'Reduced duplication and maintenance',
              'Standardized patterns and utilities',
              'Faster development cycles',
            ],
            challenges: [
              'Version management and compatibility',
              'Dependency resolution conflicts',
              'Testing across multiple packages',
              'Documentation and API stability',
            ],
            implementationSteps: [
              'Extract common functionality into libraries',
              'Set up package management and versioning',
              'Implement automated testing pipeline',
              'Create comprehensive documentation',
              'Establish release and distribution process',
            ],
            estimatedEffort: 'medium',
            priority: compatibleLibraries.length * 15,
          });
        }
      }
    }

    return opportunities;
  }

  /**
   * Analyzes mobile-backend opportunities
   */
  private async analyzeMobileBackendOpportunities(
    repositories: IndexedRepository[]
  ): Promise<IntegrationOpportunity[]> {
    const opportunities: IntegrationOpportunity[] = [];

    const mobileRepos = repositories.filter(
      (repo) =>
        repo.languages.some((lang) => ['swift', 'kotlin', 'dart'].includes(lang.toLowerCase())) ||
        repo.frameworks.some((fw) =>
          ['react-native', 'flutter', 'ionic'].includes(fw.toLowerCase())
        )
    );

    const backendRepos = repositories.filter((repo) =>
      repo.frameworks.some((fw) =>
        ['express', 'nest', 'django', 'flask'].includes(fw.toLowerCase())
      )
    );

    for (const mobile of mobileRepos) {
      for (const backend of backendRepos) {
        opportunities.push({
          id: `mobile-backend-${mobile.id}-${backend.id}`,
          repositories: [mobile.id, backend.id],
          type: 'mobile-backend',
          title: `Mobile Application: ${mobile.name} + ${backend.name}`,
          description: `Connect ${mobile.name} mobile app with ${backend.name} backend services.`,
          benefits: [
            'Native mobile experience',
            'Centralized business logic',
            'Real-time data synchronization',
            'Push notification support',
          ],
          challenges: [
            'Mobile-optimized API design',
            'Offline data handling',
            'Authentication and security',
            'Platform-specific considerations',
          ],
          implementationSteps: [
            'Design mobile-friendly API endpoints',
            'Implement authentication and authorization',
            'Set up push notification system',
            'Create offline data synchronization',
            'Implement error handling and retry logic',
            'Configure app store deployment',
          ],
          estimatedEffort: 'high',
          priority: 70,
        });
      }
    }

    return opportunities;
  }

  /**
   * Analyzes tool-chain opportunities
   */
  private async analyzeToolChainOpportunities(
    repositories: IndexedRepository[]
  ): Promise<IntegrationOpportunity[]> {
    const opportunities: IntegrationOpportunity[] = [];

    const toolRepos = repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes('tool') ||
        repo.name.toLowerCase().includes('cli') ||
        repo.name.toLowerCase().includes('build')
    );

    const projectRepos = repositories.filter((repo) => !toolRepos.includes(repo));

    if (toolRepos.length > 0 && projectRepos.length > 0) {
      opportunities.push({
        id: `toolchain-${toolRepos.map((t) => t.id).join('-')}-${projectRepos.map((p) => p.id).join('-')}`,
        repositories: [...toolRepos.map((t) => t.id), ...projectRepos.map((p) => p.id)],
        type: 'tool-chain',
        title: `Development Tool Chain Integration`,
        description: `Integrate development tools with project repositories for streamlined workflow.`,
        benefits: [
          'Automated development workflow',
          'Consistent code quality and standards',
          'Reduced manual tasks and errors',
          'Improved developer productivity',
        ],
        challenges: [
          'Tool configuration and customization',
          'Integration with existing workflows',
          'Maintenance and updates',
          'Learning curve for team members',
        ],
        implementationSteps: [
          'Analyze current development workflow',
          'Configure tools for project requirements',
          'Set up automated pipelines',
          'Create documentation and training',
          'Implement monitoring and feedback',
        ],
        estimatedEffort: 'medium',
        priority: 40,
      });
    }

    return opportunities;
  }

  /**
   * Analyzes architectural patterns across repositories
   */
  private analyzeArchitecturalPatterns(
    repositories: IndexedRepository[]
  ): { pattern: string; count: number }[] {
    const patternCount = new Map<string, number>();

    repositories.forEach((repo) => {
      // Detect patterns from frameworks and languages
      if (repo.frameworks.some((fw) => ['react', 'vue', 'angular'].includes(fw.toLowerCase()))) {
        patternCount.set(
          'SPA (Single Page Application)',
          (patternCount.get('SPA (Single Page Application)') || 0) + 1
        );
      }

      if (repo.frameworks.some((fw) => ['express', 'nest'].includes(fw.toLowerCase()))) {
        patternCount.set('REST API', (patternCount.get('REST API') || 0) + 1);
      }

      if (repo.frameworks.some((fw) => ['next.js', 'nuxt'].includes(fw.toLowerCase()))) {
        patternCount.set(
          'Server-Side Rendering',
          (patternCount.get('Server-Side Rendering') || 0) + 1
        );
      }

      if (
        repo.name.toLowerCase().includes('service') ||
        repo.tags.some((tag) => tag.includes('service'))
      ) {
        patternCount.set('Microservices', (patternCount.get('Microservices') || 0) + 1);
      }

      if (repo.frameworks.some((fw) => ['django', 'flask', 'spring'].includes(fw.toLowerCase()))) {
        patternCount.set(
          'MVC (Model-View-Controller)',
          (patternCount.get('MVC (Model-View-Controller)') || 0) + 1
        );
      }
    });

    return Array.from(patternCount.entries())
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Finds strongly connected components in the repository graph
   */
  private findStronglyConnectedComponents(
    repositories: IndexedRepository[],
    relationships: RepositoryRelationship[]
  ): IndexedRepository[][] {
    // Simple connected components algorithm
    const visited = new Set<string>();
    const components: IndexedRepository[][] = [];

    const dfs = (repoId: string, component: IndexedRepository[]) => {
      if (visited.has(repoId)) return;

      visited.add(repoId);
      const repo = repositories.find((r) => r.id === repoId);
      if (repo) {
        component.push(repo);

        // Find connected repositories
        const connectedRelationships = relationships.filter(
          (rel) => (rel.sourceId === repoId || rel.targetId === repoId) && rel.strength > 0.5
        );

        connectedRelationships.forEach((rel) => {
          const connectedId = rel.sourceId === repoId ? rel.targetId : rel.sourceId;
          dfs(connectedId, component);
        });
      }
    };

    repositories.forEach((repo) => {
      if (!visited.has(repo.id)) {
        const component: IndexedRepository[] = [];
        dfs(repo.id, component);
        if (component.length > 1) {
          components.push(component);
        }
      }
    });

    return components;
  }

  /**
   * Generates combinations of repositories
   */
  private generateCombinations<T>(items: T[], maxSize: number): T[][] {
    const combinations: T[][] = [];

    for (let size = 2; size <= Math.min(items.length, maxSize); size++) {
      const generateCombinationsOfSize = (start: number, current: T[]) => {
        if (current.length === size) {
          combinations.push([...current]);
          return;
        }

        for (let i = start; i < items.length; i++) {
          current.push(items[i]);
          generateCombinationsOfSize(i + 1, current);
          current.pop();
        }
      };

      generateCombinationsOfSize(0, []);
    }

    return combinations;
  }

  /**
   * Gets color for language-based clusters
   */
  private getLanguageColor(language: string): string {
    const colors: { [key: string]: string } = {
      javascript: '#f7df1e',
      typescript: '#3178c6',
      python: '#3776ab',
      java: '#ed8b00',
      'c#': '#239120',
      go: '#00add8',
      rust: '#000000',
      php: '#777bb4',
      ruby: '#cc342d',
      swift: '#fa7343',
      kotlin: '#7f52ff',
    };

    return colors[language.toLowerCase()] || '#6b7280';
  }

  /**
   * Gets color for framework-based clusters
   */
  private getFrameworkColor(framework: string): string {
    const colors: { [key: string]: string } = {
      react: '#61dafb',
      vue: '#4fc08d',
      angular: '#dd0031',
      express: '#000000',
      nest: '#e0234e',
      django: '#092e20',
      flask: '#000000',
      spring: '#6db33f',
    };

    return colors[framework.toLowerCase()] || '#8b5cf6';
  }

  /**
   * Gets color for numbered clusters
   */
  private getClusterColor(index: number): string {
    const colors = [
      '#ef4444',
      '#f97316',
      '#f59e0b',
      '#eab308',
      '#84cc16',
      '#22c55e',
      '#10b981',
      '#14b8a6',
      '#06b6d4',
      '#0ea5e9',
      '#3b82f6',
      '#6366f1',
      '#8b5cf6',
      '#a855f7',
      '#d946ef',
      '#ec4899',
    ];

    return colors[index % colors.length];
  }
}

export default RelationshipService;
