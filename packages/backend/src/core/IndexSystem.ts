/**
 * Repository indexing and search system
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type {
  CombinationSuggestion,
  RepositoryAnalysis,
  SearchQuery,
  SearchResult,
} from "@unified-repo-analyzer/shared/src/types/analysis";
import type {
  IndexedRepository,
  RepositoryRelationship,
  Tag,
} from "@unified-repo-analyzer/shared/src/types/repository";
import { v4 as uuidv4 } from "uuid";

/**
 * Repository index data structure
 */
export interface RepositoryIndex {
  repositories: IndexedRepository[];
  relationships: RepositoryRelationship[];
  tags: Tag[];
  lastUpdated: Date;
}

/**
 * Repository match result
 */
export interface RepositoryMatch {
  repository: IndexedRepository;
  similarity: number;
  matchReason: string;
}

/**
 * Index System for repository metadata storage and search
 */
export class IndexSystem {
  private index: RepositoryIndex = {
    repositories: [],
    relationships: [],
    tags: [],
    lastUpdated: new Date(),
  };
  private indexPath: string | null;

  /**
   * Creates a new IndexSystem instance
   *
   * @param indexPath - Optional path to store the index file
   */
  constructor(indexPath?: string) {
    this.indexPath = indexPath || null;

    // Try to load existing index if path is provided
    if (this.indexPath && fs.existsSync(this.indexPath)) {
      try {
        const indexData = fs.readFileSync(this.indexPath, "utf8");
        const loadedIndex = JSON.parse(indexData);

        // Convert string dates back to Date objects
        if (loadedIndex.lastUpdated) {
          loadedIndex.lastUpdated = new Date(loadedIndex.lastUpdated);
        }

        if (loadedIndex.repositories) {
          loadedIndex.repositories.forEach((repo: IndexedRepository) => {
            if (repo.lastAnalyzed) {
              repo.lastAnalyzed = new Date(repo.lastAnalyzed);
            }
          });
        }

        // Ensure all required fields exist
        this.index = {
          repositories: loadedIndex.repositories || [],
          relationships: loadedIndex.relationships || [],
          tags: loadedIndex.tags || [],
          lastUpdated: loadedIndex.lastUpdated || new Date(),
        };
      } catch (_error: unknown) {
        this.initializeEmptyIndex();
      }
    } else {
      this.initializeEmptyIndex();
    }
  }

  /**
   * Initializes an empty index
   */
  private initializeEmptyIndex(): void {
    this.index = {
      repositories: [],
      relationships: [],
      tags: [],
      lastUpdated: new Date(),
    };
  }

  /**
   * Adds a repository to the index
   *
   * @param analysis - Repository analysis to add to the index
   * @returns Promise resolving when repository is added
   */
  public async addRepository(analysis: RepositoryAnalysis): Promise<void> {
    // Extract metadata from analysis
    const indexedRepo = this.extractRepositoryMetadata(analysis);

    // Check if repository already exists in index
    const existingIndex = this.index.repositories.findIndex(
      (repo) => repo.path === indexedRepo.path
    );

    if (existingIndex >= 0) {
      // Update existing repository
      this.index.repositories[existingIndex] = indexedRepo;
    } else {
      // Add new repository
      this.index.repositories.push(indexedRepo);
    }

    // Update index timestamp
    this.index.lastUpdated = new Date();

    // Detect relationships with other repositories
    await this.detectRelationships(indexedRepo);

    // Save index to disk
    await this.saveIndex();
  }

  /**
   * Updates an existing repository in the index
   *
   * @param repoId - Repository ID to update
   * @param analysis - Updated repository analysis
   * @returns Promise resolving when repository is updated
   */
  public async updateRepository(
    repoId: string,
    analysis: RepositoryAnalysis
  ): Promise<void> {
    // Extract metadata from analysis
    const updatedRepo = this.extractRepositoryMetadata(analysis);

    // Ensure ID matches
    updatedRepo.id = repoId;

    // Find repository in index
    const existingIndex = this.index.repositories.findIndex(
      (repo) => repo.id === repoId
    );

    if (existingIndex >= 0) {
      // Update existing repository
      this.index.repositories[existingIndex] = updatedRepo;

      // Update index timestamp
      this.index.lastUpdated = new Date();

      // Update relationships
      await this.updateRelationships(updatedRepo);

      // Save index to disk
      await this.saveIndex();
    } else {
      throw new Error(`Repository with ID ${repoId} not found in index`);
    }
  }

  /**
   * Searches repositories based on query criteria
   *
   * @param query - Search query parameters
   * @returns Promise resolving to search results
   */
  public async searchRepositories(query: SearchQuery): Promise<SearchResult[]> {
    console.log(
      "[DEBUG] Starting search with query:",
      JSON.stringify(query, null, 2)
    );
    console.log(
      "[DEBUG] Total repositories in index:",
      this.index.repositories.length
    );

    // Log sample repository data
    if (this.index.repositories.length > 0) {
      console.log("[DEBUG] Sample repository structure:", {
        name: this.index.repositories[0].name,
        languages: this.index.repositories[0].languages,
        frameworks: this.index.repositories[0].frameworks,
        tags: this.index.repositories[0].tags,
      });
    }

    // Start with all repositories
    let results = this.index.repositories.map((repo) => ({
      repository: repo,
      score: 0,
      matches: [] as { field: string; value: string; score: number }[],
    }));

    // Filter by languages if specified
    if (query.languages && query.languages.length > 0) {
      results = results.filter((result) =>
        query.languages?.some((lang) =>
          result.repository.languages.includes(lang)
        )
      );

      // Add language matches to results
      results.forEach((result) => {
        const matchedLanguages = query.languages?.filter((lang) =>
          result.repository.languages.includes(lang)
        );

        if (matchedLanguages && matchedLanguages.length > 0) {
          result.matches.push({
            field: "languages",
            value: matchedLanguages.join(", "),
            score: matchedLanguages.length * 10,
          });

          result.score += matchedLanguages.length * 10;
        }
      });
    }

    // Filter by frameworks if specified
    if (query.frameworks && query.frameworks.length > 0) {
      results = results.filter((result) =>
        query.frameworks?.some((framework) =>
          result.repository.frameworks.includes(framework)
        )
      );

      // Add framework matches to results
      results.forEach((result) => {
        const matchedFrameworks = query.frameworks?.filter((framework) =>
          result.repository.frameworks.includes(framework)
        );

        if (matchedFrameworks && matchedFrameworks.length > 0) {
          result.matches.push({
            field: "frameworks",
            value: matchedFrameworks.join(", "),
            score: matchedFrameworks.length * 15,
          });

          result.score += matchedFrameworks.length * 15;
        }
      });
    }

    // Filter by keywords if specified
    if (query.keywords && query.keywords.length > 0) {
      results = results.filter((result) => {
        // Check if any keyword matches repository name or summary
        return query.keywords?.some(
          (keyword) =>
            result.repository.name
              .toLowerCase()
              .includes(keyword.toLowerCase()) ||
            result.repository.summary
              .toLowerCase()
              .includes(keyword.toLowerCase()) ||
            result.repository.tags.some((tag) =>
              tag.toLowerCase().includes(keyword.toLowerCase())
            )
        );
      });

      // Add keyword matches to results
      results.forEach((result) => {
        query.keywords?.forEach((keyword) => {
          const lowerKeyword = keyword.toLowerCase();

          // Check name match
          if (result.repository.name.toLowerCase().includes(lowerKeyword)) {
            result.matches.push({
              field: "name",
              value: result.repository.name,
              score: 20,
            });
            result.score += 20;
          }

          // Check summary match
          if (result.repository.summary.toLowerCase().includes(lowerKeyword)) {
            result.matches.push({
              field: "summary",
              value: `...${result.repository.summary.substring(
                Math.max(
                  0,
                  result.repository.summary
                    .toLowerCase()
                    .indexOf(lowerKeyword) - 20
                ),
                Math.min(
                  result.repository.summary.length,
                  result.repository.summary
                    .toLowerCase()
                    .indexOf(lowerKeyword) +
                    keyword.length +
                    20
                )
              )}...`,
              score: 15,
            });
            result.score += 15;
          }

          // Check tag match
          const matchedTags = result.repository.tags.filter((tag) =>
            tag.toLowerCase().includes(lowerKeyword)
          );

          if (matchedTags.length > 0) {
            result.matches.push({
              field: "tags",
              value: matchedTags.join(", "),
              score: matchedTags.length * 10,
            });
            result.score += matchedTags.length * 10;
          }
        });
      });
    }

    // Filter by file types if specified
    if (query.fileTypes && query.fileTypes.length > 0) {
      console.log("[DEBUG] Filtering by file types:", query.fileTypes);
      console.log("[DEBUG] Available repositories:", results.length);

      // Filter by file types using language mapping
      results = results.filter((result) => {
        const hasMatch = query.fileTypes?.some((fileType) => {
          const extension = fileType.toLowerCase().startsWith(".")
            ? fileType.toLowerCase()
            : `.${fileType.toLowerCase()}`;

          // Map file extensions to languages
          const extensionLanguageMap: Record<string, string[]> = {
            ".js": ["javascript"],
            ".jsx": ["javascript"],
            ".ts": ["typescript"],
            ".tsx": ["typescript"],
            ".py": ["python"],
            ".java": ["java"],
            ".cpp": ["cpp", "c++"],
            ".c": ["c"],
            ".cs": ["csharp", "c#"],
            ".php": ["php"],
            ".rb": ["ruby"],
            ".go": ["golang", "go"],
            ".rs": ["rust"],
            ".swift": ["swift"],
            ".kt": ["kotlin"],
            ".scala": ["scala"],
            ".html": ["html"],
            ".css": ["css"],
            ".scss": ["scss", "sass"],
            ".less": ["less"],
            ".json": ["json"],
            ".xml": ["xml"],
            ".yaml": ["yaml"],
            ".yml": ["yaml"],
            ".md": ["markdown"],
            ".sql": ["sql"],
            ".sh": ["bash", "shell"],
            ".dockerfile": ["docker"],
            ".vue": ["vue"],
            ".svelte": ["svelte"],
          };

          const matchingLanguages = extensionLanguageMap[extension] || [];

          // Check if repository has matching language
          return matchingLanguages.some((lang) =>
            result.repository.languages.some((l) => l.toLowerCase() === lang)
          );
        });

        if (!hasMatch) {
          console.log(
            `[DEBUG] No file type match for repo ${result.repository.name}. Languages:`,
            result.repository.languages
          );
        }

        return hasMatch;
      });

      console.log(
        "[DEBUG] Repositories after file type filter:",
        results.length
      );

      // Add file type matches to results
      results.forEach((result) => {
        const matchedFileTypes = query.fileTypes?.filter((fileType) => {
          const extension = fileType.toLowerCase().startsWith(".")
            ? fileType.toLowerCase()
            : `.${fileType.toLowerCase()}`;

          const extensionLanguageMap: Record<string, string[]> = {
            ".js": ["javascript"],
            ".jsx": ["javascript"],
            ".ts": ["typescript"],
            ".tsx": ["typescript"],
            ".py": ["python"],
            ".java": ["java"],
            ".cpp": ["cpp", "c++"],
            ".c": ["c"],
            ".cs": ["csharp", "c#"],
            ".php": ["php"],
            ".rb": ["ruby"],
            ".go": ["golang", "go"],
            ".rs": ["rust"],
            ".swift": ["swift"],
            ".kt": ["kotlin"],
            ".scala": ["scala"],
            ".html": ["html"],
            ".css": ["css"],
            ".scss": ["scss", "sass"],
            ".less": ["less"],
            ".json": ["json"],
            ".xml": ["xml"],
            ".yaml": ["yaml"],
            ".yml": ["yaml"],
            ".md": ["markdown"],
            ".sql": ["sql"],
            ".sh": ["bash", "shell"],
            ".dockerfile": ["docker"],
            ".vue": ["vue"],
            ".svelte": ["svelte"],
          };

          const matchingLanguages = extensionLanguageMap[extension] || [];

          return matchingLanguages.some((lang) =>
            result.repository.languages.some((l) => l.toLowerCase() === lang)
          );
        });

        if (matchedFileTypes && matchedFileTypes.length > 0) {
          console.log(
            `[DEBUG] Adding file type matches for ${result.repository.name}:`,
            matchedFileTypes
          );
          result.matches.push({
            field: "fileTypes",
            value: matchedFileTypes.join(", "),
            score: matchedFileTypes.length * 5,
          });

          result.score += matchedFileTypes.length * 5;
        }
      });
    }

    // Filter by date range if specified
    if (query.dateRange?.start && query.dateRange?.end) {
      results = results.filter(
        (result) =>
          result.repository.lastAnalyzed >= query.dateRange!.start! &&
          result.repository.lastAnalyzed <= query.dateRange!.end!
      );
    }

    // Sort results by score (descending)
    results.sort((a, b) => b.score - a.score);

    return results;
  }

  /**
   * Finds similar repositories to the specified repository
   *
   * @param repoId - Repository ID to find similar repositories for
   * @returns Promise resolving to repository matches
   */
  public async findSimilarRepositories(
    repoId: string
  ): Promise<RepositoryMatch[]> {
    // Find repository in index
    const repository = this.index.repositories.find(
      (repo) => repo.id === repoId
    );

    if (!repository) {
      throw new Error(`Repository with ID ${repoId} not found in index`);
    }

    // Find relationships for this repository
    const relationships = this.index.relationships.filter(
      (rel) => rel.sourceId === repoId || rel.targetId === repoId
    );

    // Convert relationships to matches
    const matches: RepositoryMatch[] = relationships.map((rel) => {
      // Get the other repository in the relationship
      const otherRepoId = rel.sourceId === repoId ? rel.targetId : rel.sourceId;
      const otherRepo = this.index.repositories.find(
        (repo) => repo.id === otherRepoId
      );

      if (!otherRepo) {
        throw new Error(
          `Related repository with ID ${otherRepoId} not found in index`
        );
      }

      return {
        repository: otherRepo,
        similarity: rel.strength,
        matchReason: rel.reason,
      };
    });

    // Sort matches by similarity (descending)
    matches.sort((a, b) => b.similarity - a.similarity);

    return matches;
  }

  /**
   * Suggests combinations of repositories that could work well together
   *
   * @param repoIds - Repository IDs to suggest combinations for
   * @returns Promise resolving to combination suggestions
   */
  public async suggestCombinations(
    repoIds: string[]
  ): Promise<CombinationSuggestion[]> {
    // Remove duplicates and validate repository IDs
    const uniqueRepoIds = [...new Set(repoIds)];
    const repositories = uniqueRepoIds.map((id) => {
      const repo = this.index.repositories.find((r) => r.id === id);
      if (!repo) {
        throw new Error(`Repository with ID ${id} not found in index`);
      }
      return repo;
    });

    const suggestions: CombinationSuggestion[] = [];

    // Generate all possible combinations (pairs, triplets, etc.)
    for (let size = 2; size <= Math.min(repositories.length, 4); size++) {
      const combinations = this.generateCombinations(repositories, size);

      for (const combination of combinations) {
        const suggestion = await this.analyzeCombination(combination);
        if (suggestion.compatibility > 0.3) {
          // Only include viable combinations
          suggestions.push(suggestion);
        }
      }
    }

    // Sort by compatibility score (descending)
    suggestions.sort((a, b) => b.compatibility - a.compatibility);

    // Limit to top 10 suggestions to avoid overwhelming the user
    return suggestions.slice(0, 10);
  }

  /**
   * Generates all combinations of repositories of a given size
   */
  private generateCombinations<T>(items: T[], size: number): T[][] {
    if (size === 1) return items.map((item) => [item]);
    if (size > items.length) return [];

    const combinations: T[][] = [];

    for (let i = 0; i <= items.length - size; i++) {
      const head = items[i];
      const tailCombinations = this.generateCombinations(
        items.slice(i + 1),
        size - 1
      );

      for (const tailCombination of tailCombinations) {
        combinations.push([head, ...tailCombination]);
      }
    }

    return combinations;
  }

  /**
   * Analyzes a combination of repositories for compatibility
   */
  private async analyzeCombination(
    repositories: IndexedRepository[]
  ): Promise<CombinationSuggestion> {
    const repoIds = repositories.map((repo) => repo.id);
    let totalCompatibility = 0;
    const rationale: string[] = [];
    const integrationPoints: string[] = [];

    // Analyze pairwise compatibility
    const pairwiseScores: number[] = [];
    for (let i = 0; i < repositories.length; i++) {
      for (let j = i + 1; j < repositories.length; j++) {
        const similarity = this.calculateSimilarity(
          repositories[i],
          repositories[j]
        );
        pairwiseScores.push(similarity.score);
      }
    }

    // Calculate average pairwise compatibility
    const avgPairwiseCompatibility =
      pairwiseScores.length > 0
        ? pairwiseScores.reduce((sum, score) => sum + score, 0) /
          pairwiseScores.length
        : 0;

    totalCompatibility = avgPairwiseCompatibility;

    // Analyze architectural patterns
    const architecturalAnalysis =
      this.analyzeArchitecturalCompatibility(repositories);
    totalCompatibility += architecturalAnalysis.score * 0.3;
    rationale.push(...architecturalAnalysis.rationale);
    integrationPoints.push(...architecturalAnalysis.integrationPoints);

    // Analyze technology stack synergy
    const techStackAnalysis = this.analyzeTechStackSynergy(repositories);
    totalCompatibility += techStackAnalysis.score * 0.2;
    rationale.push(...techStackAnalysis.rationale);
    integrationPoints.push(...techStackAnalysis.integrationPoints);

    // Analyze complementary functionality
    const functionalityAnalysis =
      this.analyzeFunctionalityComplementarity(repositories);
    totalCompatibility += functionalityAnalysis.score * 0.3;
    rationale.push(...functionalityAnalysis.rationale);
    integrationPoints.push(...functionalityAnalysis.integrationPoints);

    // Analyze development workflow compatibility
    const workflowAnalysis = this.analyzeWorkflowCompatibility(repositories);
    totalCompatibility += workflowAnalysis.score * 0.2;
    rationale.push(...workflowAnalysis.rationale);
    integrationPoints.push(...workflowAnalysis.integrationPoints);

    // Normalize compatibility score
    totalCompatibility = Math.min(totalCompatibility, 1.0);

    return {
      repositories: repoIds,
      compatibility: totalCompatibility,
      rationale: rationale.join(". "),
      integrationPoints: [...new Set(integrationPoints)], // Remove duplicates
    };
  }

  /**
   * Analyzes architectural compatibility between repositories
   */
  private analyzeArchitecturalCompatibility(
    repositories: IndexedRepository[]
  ): {
    score: number;
    rationale: string[];
    integrationPoints: string[];
  } {
    const rationale: string[] = [];
    const integrationPoints: string[] = [];
    let score = 0;

    // Check for full-stack combinations
    const frontendRepos = repositories.filter((repo) =>
      this.isFrontendRepo(repo)
    );
    const backendRepos = repositories.filter((repo) =>
      this.isBackendRepo(repo)
    );
    const mobileRepos = repositories.filter((repo) => this.isMobileRepo(repo));

    if (frontendRepos.length > 0 && backendRepos.length > 0) {
      score += 0.8;
      rationale.push(
        "Full-stack application potential with frontend and backend components"
      );
      integrationPoints.push("REST API integration");
      integrationPoints.push("Shared authentication system");
      integrationPoints.push("Common data models");
    }

    if (mobileRepos.length > 0 && backendRepos.length > 0) {
      score += 0.7;
      rationale.push("Mobile application with backend services");
      integrationPoints.push("Mobile API endpoints");
      integrationPoints.push("Push notification system");
      integrationPoints.push("Mobile-optimized data synchronization");
    }

    // Check for microservices architecture
    const serviceRepos = repositories.filter(
      (repo) =>
        repo.tags.some((tag) => tag.toLowerCase().includes("service")) ||
        repo.name.toLowerCase().includes("service")
    );

    if (serviceRepos.length >= 2) {
      score += 0.6;
      rationale.push(
        "Microservices architecture with multiple service components"
      );
      integrationPoints.push("Service mesh integration");
      integrationPoints.push("Inter-service communication");
      integrationPoints.push("Distributed logging and monitoring");
    }

    // Check for library ecosystem
    const libraryRepos = repositories.filter((repo) =>
      this.isLibraryRepo(repo)
    );
    const applicationRepos = repositories.filter((repo) =>
      this.isApplicationRepo(repo)
    );

    if (libraryRepos.length > 0 && applicationRepos.length > 0) {
      score += 0.5;
      rationale.push(
        "Library and application combination for modular architecture"
      );
      integrationPoints.push("Package dependency management");
      integrationPoints.push("Shared utility functions");
      integrationPoints.push("Common configuration patterns");
    }

    return { score: Math.min(score, 1.0), rationale, integrationPoints };
  }

  /**
   * Analyzes technology stack synergy
   */
  private analyzeTechStackSynergy(repositories: IndexedRepository[]): {
    score: number;
    rationale: string[];
    integrationPoints: string[];
  } {
    const rationale: string[] = [];
    const integrationPoints: string[] = [];
    let score = 0;

    // Collect all languages and frameworks
    const allLanguages = [
      ...new Set(repositories.flatMap((repo) => repo.languages)),
    ];
    const allFrameworks = [
      ...new Set(repositories.flatMap((repo) => repo.frameworks)),
    ];

    // Check for ecosystem coherence
    const ecosystemScores = {
      javascript: 0,
      python: 0,
      java: 0,
      dotnet: 0,
    };

    // JavaScript ecosystem
    if (
      allLanguages.some((lang) =>
        ["javascript", "typescript"].includes(lang.toLowerCase())
      )
    ) {
      ecosystemScores.javascript += 0.3;
      if (
        allFrameworks.some((fw) =>
          ["node.js", "express", "nest"].includes(fw.toLowerCase())
        )
      ) {
        ecosystemScores.javascript += 0.2;
      }
      if (
        allFrameworks.some((fw) =>
          ["react", "vue", "angular"].includes(fw.toLowerCase())
        )
      ) {
        ecosystemScores.javascript += 0.2;
      }
    }

    // Python ecosystem
    if (allLanguages.includes("python")) {
      ecosystemScores.python += 0.3;
      if (
        allFrameworks.some((fw) =>
          ["django", "flask", "fastapi"].includes(fw.toLowerCase())
        )
      ) {
        ecosystemScores.python += 0.3;
      }
    }

    // Find the strongest ecosystem
    const strongestEcosystem = Object.entries(ecosystemScores).reduce(
      (max, [ecosystem, score]) =>
        score > max.score ? { ecosystem, score } : max,
      { ecosystem: "", score: 0 }
    );

    if (strongestEcosystem.score > 0.5) {
      score += strongestEcosystem.score;
      rationale.push(
        `Strong ${strongestEcosystem.ecosystem} ecosystem coherence`
      );
      integrationPoints.push("Shared development tools and practices");
      integrationPoints.push("Common package management");
      integrationPoints.push("Unified build and deployment pipeline");
    }

    // Check for complementary technologies
    const complementaryPairs = [
      {
        frontend: ["react", "vue", "angular"],
        backend: ["express", "nest", "django", "flask"],
      },
      {
        database: ["mongodb", "postgresql", "mysql"],
        backend: ["express", "django", "spring"],
      },
      {
        mobile: ["react-native", "flutter"],
        backend: ["express", "django", "spring"],
      },
    ];

    for (const pair of complementaryPairs) {
      const hasFrontend =
        pair.frontend &&
        allFrameworks.some((fw) => pair.frontend.includes(fw.toLowerCase()));
      const hasBackend =
        pair.backend &&
        allFrameworks.some((fw) => pair.backend.includes(fw.toLowerCase()));

      if (hasFrontend && hasBackend) {
        score += 0.3;
        rationale.push("Complementary technology stack detected");
        integrationPoints.push("Technology-specific integration patterns");
      }
    }

    return { score: Math.min(score, 1.0), rationale, integrationPoints };
  }

  /**
   * Analyzes functionality complementarity
   */
  private analyzeFunctionalityComplementarity(
    repositories: IndexedRepository[]
  ): {
    score: number;
    rationale: string[];
    integrationPoints: string[];
  } {
    const rationale: string[] = [];
    const integrationPoints: string[] = [];
    let score = 0;

    // Analyze repository purposes based on names and summaries
    const purposes = repositories.map((repo) =>
      this.inferRepositoryPurpose(repo)
    );

    // Check for complementary purposes
    const complementaryPurposes = [
      ["frontend", "backend"],
      ["api", "client"],
      ["library", "application"],
      ["service", "gateway"],
      ["database", "api"],
      ["auth", "application"],
      ["monitoring", "application"],
    ];

    let hasComplementaryPair = false;
    for (const [purposeA, purposeB] of complementaryPurposes) {
      const hasA = purposes.some((purpose) => purpose.includes(purposeA));
      const hasB = purposes.some((purpose) => purpose.includes(purposeB));

      if (hasA && hasB) {
        hasComplementaryPair = true;
        score += 0.4;
        // Capitalize the purpose names for better readability
        const capitalizedA =
          purposeA.charAt(0).toUpperCase() + purposeA.slice(1);
        const capitalizedB =
          purposeB.charAt(0).toUpperCase() + purposeB.slice(1);
        rationale.push(
          `${capitalizedA} and ${capitalizedB} combination provides complementary functionality`
        );
        integrationPoints.push(`${purposeA}-${purposeB} integration layer`);
      }
    }

    // Check for functional diversity only if no specific complementary pairs found
    if (!hasComplementaryPair) {
      const uniquePurposes = [...new Set(purposes.flat())];
      if (uniquePurposes.length >= repositories.length) {
        score += 0.2;
        rationale.push(
          "Diverse functionality provides comprehensive system coverage"
        );
        integrationPoints.push("Unified system architecture");
      }
    }

    return { score: Math.min(score, 1.0), rationale, integrationPoints };
  }

  /**
   * Analyzes development workflow compatibility
   */
  private analyzeWorkflowCompatibility(repositories: IndexedRepository[]): {
    score: number;
    rationale: string[];
    integrationPoints: string[];
  } {
    const rationale: string[] = [];
    const integrationPoints: string[] = [];
    let score = 0;

    // Check for similar complexity levels (easier to maintain together)
    const complexities = repositories.map((repo) => repo.complexity);
    const avgComplexity =
      complexities.reduce((sum, c) => sum + c, 0) / complexities.length;
    const complexityVariance =
      complexities.reduce((sum, c) => sum + (c - avgComplexity) ** 2, 0) /
      complexities.length;

    if (complexityVariance < 100) {
      // Low variance in complexity
      score += 0.3;
      rationale.push(
        "Similar complexity levels facilitate unified development workflow"
      );
      integrationPoints.push("Shared development standards");
      integrationPoints.push("Common code review processes");
    }

    // Check for similar sizes (easier to manage together)
    const sizes = repositories.map((repo) => repo.size);
    const sizeRatios = sizes.map((size) => size / Math.max(...sizes));
    const avgSizeRatio =
      sizeRatios.reduce((sum, ratio) => sum + ratio, 0) / sizeRatios.length;

    if (avgSizeRatio > 0.3) {
      // Repositories are relatively similar in size
      score += 0.2;
      rationale.push(
        "Similar project sizes enable consistent development practices"
      );
      integrationPoints.push("Unified project structure");
      integrationPoints.push("Common tooling and scripts");
    }

    return { score: Math.min(score, 1.0), rationale, integrationPoints };
  }

  /**
   * Infers the purpose of a repository based on its characteristics
   */
  private inferRepositoryPurpose(repo: IndexedRepository): string[] {
    const purposes: string[] = [];

    // Analyze name and tags
    const name = repo.name.toLowerCase();
    const tags = repo.tags.map((tag) => tag.toLowerCase());
    const nameKeywords = {
      frontend: ["frontend", "client", "ui", "web", "app"],
      backend: ["backend", "server", "api", "service"],
      database: ["db", "database", "storage", "data"],
      auth: ["auth", "authentication", "login", "oauth"],
      monitoring: ["monitor", "logging", "metrics", "analytics"],
      testing: ["test", "testing", "spec", "e2e"],
      deployment: ["deploy", "ci", "cd", "build"],
      library: ["lib", "library", "util", "helper"],
      mobile: ["mobile", "ios", "android", "native"],
    };

    for (const [purpose, keywords] of Object.entries(nameKeywords)) {
      if (
        keywords.some(
          (keyword) =>
            name.includes(keyword) || tags.some((tag) => tag.includes(keyword))
        )
      ) {
        purposes.push(purpose);
      }
    }

    // Analyze frameworks
    if (
      repo.frameworks.some((fw) =>
        ["react", "vue", "angular"].includes(fw.toLowerCase())
      )
    ) {
      purposes.push("frontend");
    }
    if (
      repo.frameworks.some((fw) =>
        ["express", "nest", "django", "flask"].includes(fw.toLowerCase())
      )
    ) {
      purposes.push("backend");
    }
    if (
      repo.frameworks.some((fw) =>
        ["react-native", "flutter", "ionic"].includes(fw.toLowerCase())
      )
    ) {
      purposes.push("mobile");
    }

    // Analyze languages
    if (
      repo.languages.some((lang) =>
        ["swift", "kotlin", "dart"].includes(lang.toLowerCase())
      )
    ) {
      purposes.push("mobile");
    }

    return purposes.length > 0 ? purposes : ["application"];
  }

  /**
   * Gets the current repository index
   *
   * @returns Current repository index
   */
  public getIndex(): RepositoryIndex {
    return this.index;
  }

  /**
   * Gets the current number of repositories in the index
   *
   * @returns Number of repositories
   */
  public getRepositoryCount(): number {
    return this.index.repositories.length;
  }

  /**
   * Sets the repository index (useful for loading from persistent storage)
   *
   * @param index - Repository index to set
   */
  public setIndex(index: RepositoryIndex): void {
    this.index = index;
    this.saveIndex();
  }

  /**
   * Saves the index to disk if a path is configured
   *
   * @returns Promise resolving when index is saved
   */
  public async saveIndex(): Promise<void> {
    if (!this.indexPath) {
      return;
    }

    try {
      // Ensure directory exists
      const dir = path.dirname(this.indexPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write index to file
      fs.writeFileSync(
        this.indexPath,
        JSON.stringify(this.index, null, 2),
        "utf8"
      );
    } catch (error) {
      throw new Error(`Failed to save index to ${this.indexPath}: ${error}`);
    }
  }

  /**
   * Sets the path for index persistence
   *
   * @param indexPath - Path to store the index file
   */
  public setIndexPath(indexPath: string): void {
    this.indexPath = indexPath;
  }

  /**
   * Extracts repository metadata from analysis for indexing
   *
   * @param analysis - Repository analysis
   * @returns Indexed repository metadata
   */
  private extractRepositoryMetadata(
    analysis: RepositoryAnalysis
  ): IndexedRepository {
    // Calculate complexity score (simplified)
    const complexity =
      analysis.codeAnalysis.complexity?.maintainabilityIndex ||
      (analysis.fileCount > 0
        ? (analysis.codeAnalysis.functionCount +
            analysis.codeAnalysis.classCount) /
          analysis.fileCount
        : 0);

    // Extract tags from analysis
    const tags: string[] = [];

    // Add language tags
    (analysis.languages || []).forEach((lang) => tags.push(`lang:${lang}`));

    // Add framework tags
    (analysis.frameworks || []).forEach((fw) => tags.push(`framework:${fw}`));

    // Add complexity tag
    if (complexity < 30) tags.push("complexity:low");
    else if (complexity < 70) tags.push("complexity:medium");
    else tags.push("complexity:high");

    // Create indexed repository
    return {
      id: analysis.id,
      name: analysis.name,
      path: analysis.path,
      languages: analysis.languages || [],
      frameworks: analysis.frameworks || [],
      tags,
      summary:
        analysis.description ||
        analysis.insights.executiveSummary.substring(0, 200),
      lastAnalyzed: analysis.updatedAt,
      size: analysis.totalSize,
      complexity,
    };
  }

  /**
   * Detects relationships between repositories
   *
   * @param repository - Repository to detect relationships for
   * @returns Promise resolving when relationships are detected
   */
  private async detectRelationships(
    repository: IndexedRepository
  ): Promise<void> {
    // Remove existing relationships for this repository
    this.index.relationships = this.index.relationships.filter(
      (rel) => rel.sourceId !== repository.id && rel.targetId !== repository.id
    );

    // Compare with all other repositories
    for (const otherRepo of this.index.repositories) {
      // Skip self-comparison
      if (otherRepo.id === repository.id) continue;

      // Calculate similarity score
      const similarity = this.calculateSimilarity(repository, otherRepo);

      // If similarity is above threshold, create relationship
      if (similarity.score > 0.3) {
        this.index.relationships.push({
          sourceId: repository.id,
          targetId: otherRepo.id,
          type: similarity.type,
          strength: similarity.score,
          reason: similarity.reason,
        });
      }
    }
  }

  /**
   * Updates relationships for a repository
   *
   * @param repository - Repository to update relationships for
   * @returns Promise resolving when relationships are updated
   */
  private async updateRelationships(
    repository: IndexedRepository
  ): Promise<void> {
    // Simply re-detect relationships
    await this.detectRelationships(repository);
  }

  /**
   * Calculates similarity between two repositories using advanced algorithms
   *
   * @param repoA - First repository
   * @param repoB - Second repository
   * @returns Similarity score and type
   */
  private calculateSimilarity(
    repoA: IndexedRepository,
    repoB: IndexedRepository
  ): {
    score: number;
    type: "similar" | "complementary" | "dependency" | "fork";
    reason: string;
  } {
    let score = 0;
    const reasons: string[] = [];

    // Advanced language similarity with weighted scoring
    const languageSimilarity = this.calculateLanguageSimilarity(repoA, repoB);
    score += languageSimilarity.score * 0.25;
    if (languageSimilarity.reasons.length > 0) {
      reasons.push(...languageSimilarity.reasons);
    }

    // Framework compatibility analysis
    const frameworkCompatibility = this.calculateFrameworkCompatibility(
      repoA,
      repoB
    );
    score += frameworkCompatibility.score * 0.25;
    if (frameworkCompatibility.reasons.length > 0) {
      reasons.push(...frameworkCompatibility.reasons);
    }

    // Architectural pattern similarity
    const architecturalSimilarity = this.calculateArchitecturalSimilarity(
      repoA,
      repoB
    );
    score += architecturalSimilarity.score * 0.15;
    if (architecturalSimilarity.reasons.length > 0) {
      reasons.push(...architecturalSimilarity.reasons);
    }

    // Technology stack compatibility
    const techStackCompatibility = this.calculateTechStackCompatibility(
      repoA,
      repoB
    );
    score += techStackCompatibility.score * 0.15;
    if (techStackCompatibility.reasons.length > 0) {
      reasons.push(...techStackCompatibility.reasons);
    }

    // Project structure similarity
    const structureSimilarity = this.calculateStructureSimilarity(repoA, repoB);
    score += structureSimilarity.score * 0.1;
    if (structureSimilarity.reasons.length > 0) {
      reasons.push(...structureSimilarity.reasons);
    }

    // Name and semantic similarity
    const semanticSimilarity = this.calculateSemanticSimilarity(repoA, repoB);
    score += semanticSimilarity.score * 0.1;
    if (semanticSimilarity.reasons.length > 0) {
      reasons.push(...semanticSimilarity.reasons);
    }

    // Determine relationship type using enhanced logic
    const relationshipType = this.determineRelationshipType(
      repoA,
      repoB,
      score,
      reasons
    );

    return {
      score: Math.min(score, 1.0), // Cap at 1.0
      type: relationshipType.type,
      reason: reasons.join(". "),
    };
  }

  /**
   * Calculates language similarity with weighted scoring
   */
  private calculateLanguageSimilarity(
    repoA: IndexedRepository,
    repoB: IndexedRepository
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Language weights based on popularity and ecosystem compatibility
    const languageWeights: { [key: string]: number } = {
      javascript: 1.0,
      typescript: 1.0,
      python: 0.9,
      java: 0.8,
      "c#": 0.8,
      go: 0.7,
      rust: 0.7,
      php: 0.6,
      ruby: 0.6,
      swift: 0.5,
      kotlin: 0.5,
    };

    const sharedLanguages = repoA.languages.filter((lang) =>
      repoB.languages.includes(lang)
    );

    if (sharedLanguages.length > 0) {
      // Calculate weighted similarity
      const weightedSharedScore = sharedLanguages.reduce((sum, lang) => {
        return sum + (languageWeights[lang.toLowerCase()] || 0.3);
      }, 0);

      const maxPossibleWeight = Math.max(
        repoA.languages.reduce(
          (sum, lang) => sum + (languageWeights[lang.toLowerCase()] || 0.3),
          0
        ),
        repoB.languages.reduce(
          (sum, lang) => sum + (languageWeights[lang.toLowerCase()] || 0.3),
          0
        )
      );

      score = weightedSharedScore / maxPossibleWeight;
      reasons.push(
        `Shares ${sharedLanguages.length} languages: ${sharedLanguages.join(", ")}`
      );

      // Bonus for high-compatibility language pairs
      if (
        sharedLanguages.includes("javascript") &&
        sharedLanguages.includes("typescript")
      ) {
        score += 0.1;
        reasons.push("JavaScript/TypeScript ecosystem compatibility");
      }
    }

    // Check for complementary language pairs
    const complementaryPairs = [
      ["javascript", "python"],
      ["typescript", "python"],
      ["javascript", "java"],
      ["python", "go"],
      ["javascript", "php"],
    ];

    for (const [langA, langB] of complementaryPairs) {
      if (
        (repoA.languages.some((l) => l.toLowerCase() === langA) &&
          repoB.languages.some((l) => l.toLowerCase() === langB)) ||
        (repoA.languages.some((l) => l.toLowerCase() === langB) &&
          repoB.languages.some((l) => l.toLowerCase() === langA))
      ) {
        score += 0.2;
        reasons.push(`Complementary language pair: ${langA}/${langB}`);
      }
    }

    return { score: Math.min(score, 1.0), reasons };
  }

  /**
   * Calculates framework compatibility
   */
  private calculateFrameworkCompatibility(
    repoA: IndexedRepository,
    repoB: IndexedRepository
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Framework compatibility matrix
    const compatibilityMatrix: { [key: string]: string[] } = {
      react: ["express", "nest", "next.js", "gatsby", "node.js"],
      vue: ["express", "nuxt", "node.js"],
      angular: ["nest", "express", "node.js"],
      express: ["react", "vue", "angular", "node.js"],
      nest: ["react", "angular", "node.js"],
      django: ["react", "vue", "angular"],
      flask: ["react", "vue", "angular"],
      spring: ["react", "vue", "angular"],
      rails: ["react", "vue", "angular"],
    };

    const sharedFrameworks = repoA.frameworks.filter((fw) =>
      repoB.frameworks.includes(fw)
    );

    if (sharedFrameworks.length > 0) {
      const frameworkScore =
        sharedFrameworks.length /
        Math.max(repoA.frameworks.length, repoB.frameworks.length);
      score += frameworkScore;
      reasons.push(
        `Shares ${sharedFrameworks.length} frameworks: ${sharedFrameworks.join(", ")}`
      );
    }

    // Check for compatible framework pairs
    for (const frameworkA of repoA.frameworks) {
      const compatibleFrameworks =
        compatibilityMatrix[frameworkA.toLowerCase()] || [];
      for (const frameworkB of repoB.frameworks) {
        if (compatibleFrameworks.includes(frameworkB.toLowerCase())) {
          score += 0.3;
          reasons.push(`Compatible frameworks: ${frameworkA} ↔ ${frameworkB}`);
        }
      }
    }

    return { score: Math.min(score, 1.0), reasons };
  }

  /**
   * Calculates architectural pattern similarity
   */
  private calculateArchitecturalSimilarity(
    repoA: IndexedRepository,
    repoB: IndexedRepository
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Extract architectural patterns from tags and frameworks
    const getArchitecturalPatterns = (repo: IndexedRepository): string[] => {
      const patterns: string[] = [];

      // Infer patterns from frameworks
      if (
        repo.frameworks.some((f) =>
          ["react", "vue", "angular"].includes(f.toLowerCase())
        )
      ) {
        patterns.push("spa", "component-based");
      }
      if (
        repo.frameworks.some((f) =>
          ["express", "nest", "django", "flask"].includes(f.toLowerCase())
        )
      ) {
        patterns.push("rest-api", "mvc");
      }
      if (
        repo.frameworks.some((f) =>
          ["next.js", "nuxt", "gatsby"].includes(f.toLowerCase())
        )
      ) {
        patterns.push("ssr", "static-generation");
      }

      // Infer from tags
      const microserviceIndicators = ["microservice", "api", "service"];
      if (
        repo.tags.some((tag) =>
          microserviceIndicators.some((indicator) =>
            tag.toLowerCase().includes(indicator)
          )
        )
      ) {
        patterns.push("microservices");
      }

      return patterns;
    };

    const patternsA = getArchitecturalPatterns(repoA);
    const patternsB = getArchitecturalPatterns(repoB);

    const sharedPatterns = patternsA.filter((pattern) =>
      patternsB.includes(pattern)
    );

    if (sharedPatterns.length > 0) {
      score =
        sharedPatterns.length / Math.max(patternsA.length, patternsB.length, 1);
      reasons.push(
        `Shared architectural patterns: ${sharedPatterns.join(", ")}`
      );
    }

    return { score, reasons };
  }

  /**
   * Calculates technology stack compatibility
   */
  private calculateTechStackCompatibility(
    repoA: IndexedRepository,
    repoB: IndexedRepository
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Technology ecosystem compatibility
    const ecosystems = {
      javascript: ["node.js", "npm", "webpack", "babel", "jest"],
      python: ["pip", "django", "flask", "pytest", "virtualenv"],
      java: ["maven", "gradle", "spring", "junit"],
      dotnet: ["nuget", "asp.net", "entity-framework"],
    };

    // Check for ecosystem alignment
    for (const [ecosystem, technologies] of Object.entries(ecosystems)) {
      const repoAInEcosystem =
        repoA.languages.some((lang) =>
          lang.toLowerCase().includes(ecosystem)
        ) ||
        repoA.frameworks.some((fw) =>
          technologies.some((tech) => fw.toLowerCase().includes(tech))
        );
      const repoBInEcosystem =
        repoB.languages.some((lang) =>
          lang.toLowerCase().includes(ecosystem)
        ) ||
        repoB.frameworks.some((fw) =>
          technologies.some((tech) => fw.toLowerCase().includes(tech))
        );

      if (repoAInEcosystem && repoBInEcosystem) {
        score += 0.4;
        reasons.push(`Both repositories use ${ecosystem} ecosystem`);
      }
    }

    return { score: Math.min(score, 1.0), reasons };
  }

  /**
   * Calculates project structure similarity
   */
  private calculateStructureSimilarity(
    repoA: IndexedRepository,
    repoB: IndexedRepository
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Size similarity
    const sizeRatio =
      Math.min(repoA.size, repoB.size) / Math.max(repoA.size, repoB.size);
    if (sizeRatio > 0.5) {
      score += sizeRatio * 0.5;
      reasons.push(
        `Similar project sizes (${Math.round(sizeRatio * 100)}% similarity)`
      );
    }

    // Complexity similarity
    const complexityRatio =
      Math.min(repoA.complexity, repoB.complexity) /
      Math.max(repoA.complexity, repoB.complexity);
    if (complexityRatio > 0.5) {
      score += complexityRatio * 0.5;
      reasons.push(
        `Similar complexity levels (${Math.round(complexityRatio * 100)}% similarity)`
      );
    }

    return { score, reasons };
  }

  /**
   * Calculates semantic similarity based on names and descriptions
   */
  private calculateSemanticSimilarity(
    repoA: IndexedRepository,
    repoB: IndexedRepository
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Name similarity (potential fork or related project)
    const nameA = repoA.name.toLowerCase();
    const nameB = repoB.name.toLowerCase();

    if (nameA.includes(nameB) || nameB.includes(nameA)) {
      score += 0.6;
      reasons.push("Similar repository names suggest related projects");
    } else {
      // Check for common words in names
      const wordsA = nameA.split(/[-_\s]+/);
      const wordsB = nameB.split(/[-_\s]+/);
      const commonWords = wordsA.filter(
        (word) => wordsB.includes(word) && word.length > 2
      );

      if (commonWords.length > 0) {
        score += Math.min(commonWords.length * 0.2, 0.4);
        reasons.push(`Common name elements: ${commonWords.join(", ")}`);
      }
    }

    // Summary/description similarity
    const summaryA = repoA.summary.toLowerCase();
    const summaryB = repoB.summary.toLowerCase();

    // Simple keyword matching
    const keywordsA = summaryA.split(/\s+/).filter((word) => word.length > 3);
    const keywordsB = summaryB.split(/\s+/).filter((word) => word.length > 3);
    const commonKeywords = keywordsA.filter((word) => keywordsB.includes(word));

    if (commonKeywords.length > 0) {
      const keywordSimilarity =
        commonKeywords.length / Math.max(keywordsA.length, keywordsB.length);
      score += keywordSimilarity * 0.3;
      reasons.push(
        `Similar descriptions (${commonKeywords.length} common keywords)`
      );
    }

    return { score, reasons };
  }

  /**
   * Determines the relationship type based on analysis
   */
  private determineRelationshipType(
    repoA: IndexedRepository,
    repoB: IndexedRepository,
    score: number,
    _reasons: string[]
  ): { type: "similar" | "complementary" | "dependency" | "fork" } {
    // Check for potential fork (high name similarity + high overall similarity)
    const nameA = repoA.name.toLowerCase();
    const nameB = repoB.name.toLowerCase();

    if (score > 0.8 && (nameA.includes(nameB) || nameB.includes(nameA))) {
      return { type: "fork" };
    }

    // Check for dependency relationship first (more specific than complementary)
    if (this.isDependencyRelationship(repoA, repoB)) {
      return { type: "dependency" };
    }

    // Check for complementary repositories (frontend-backend, library-app pairs)
    if (this.areComplementaryRepositories(repoA, repoB)) {
      return { type: "complementary" };
    }

    // Default to similar for high scores, complementary for moderate scores
    if (score > 0.6) {
      return { type: "similar" };
    }
    if (score > 0.3) {
      return { type: "complementary" };
    }

    return { type: "similar" };
  }

  /**
   * Checks if two repositories are complementary
   */
  private areComplementaryRepositories(
    repoA: IndexedRepository,
    repoB: IndexedRepository
  ): boolean {
    // Frontend-Backend complementarity
    if (
      (this.isFrontendRepo(repoA) && this.isBackendRepo(repoB)) ||
      (this.isBackendRepo(repoA) && this.isFrontendRepo(repoB))
    ) {
      return true;
    }

    // Library-Application complementarity
    if (
      (this.isLibraryRepo(repoA) && this.isApplicationRepo(repoB)) ||
      (this.isApplicationRepo(repoA) && this.isLibraryRepo(repoB))
    ) {
      return true;
    }

    // Mobile-Backend complementarity
    if (
      (this.isMobileRepo(repoA) && this.isBackendRepo(repoB)) ||
      (this.isBackendRepo(repoA) && this.isMobileRepo(repoB))
    ) {
      return true;
    }

    return false;
  }

  /**
   * Checks if there's a dependency relationship
   */
  private isDependencyRelationship(
    repoA: IndexedRepository,
    repoB: IndexedRepository
  ): boolean {
    // Library to application dependency
    if (this.isLibraryRepo(repoA) && !this.isLibraryRepo(repoB)) {
      return true;
    }
    if (this.isLibraryRepo(repoB) && !this.isLibraryRepo(repoA)) {
      return true;
    }

    // Tool/utility to project dependency
    if (this.isToolRepo(repoA) && !this.isToolRepo(repoB)) {
      return true;
    }
    if (this.isToolRepo(repoB) && !this.isToolRepo(repoA)) {
      return true;
    }

    return false;
  }

  /**
   * Determines if a repository is likely a frontend application
   *
   * @param repo - Repository to check
   * @returns True if repository is likely a frontend application
   */
  private isFrontendRepo(repo: IndexedRepository): boolean {
    const frontendFrameworks = [
      "react",
      "vue",
      "angular",
      "svelte",
      "next.js",
      "nuxt",
    ];
    return repo.frameworks.some((fw) =>
      frontendFrameworks.some((frontFw) => fw.toLowerCase().includes(frontFw))
    );
  }

  /**
   * Determines if a repository is likely a backend application
   *
   * @param repo - Repository to check
   * @returns True if repository is likely a backend application
   */
  private isBackendRepo(repo: IndexedRepository): boolean {
    const backendFrameworks = [
      "express",
      "nest",
      "django",
      "flask",
      "spring",
      "rails",
      "laravel",
    ];
    return repo.frameworks.some((fw) =>
      backendFrameworks.some((backFw) => fw.toLowerCase().includes(backFw))
    );
  }

  /**
   * Determines if a repository is likely a library or utility
   *
   * @param repo - Repository to check
   * @returns True if repository is likely a library
   */
  private isLibraryRepo(repo: IndexedRepository): boolean {
    // Check for common library indicators in name
    const libraryKeywords = [
      "lib",
      "library",
      "sdk",
      "toolkit",
      "util",
      "helper",
      "common",
      "core",
      "shared",
    ];
    if (
      libraryKeywords.some((keyword) =>
        repo.name.toLowerCase().includes(keyword)
      )
    ) {
      return true;
    }

    // Check for library indicators in tags
    const libraryTags = repo.tags.filter((tag) =>
      ["library", "package", "module", "component", "utility"].some(
        (indicator) => tag.toLowerCase().includes(indicator)
      )
    );
    if (libraryTags.length > 0) {
      return true;
    }

    // Libraries often have fewer files but higher complexity
    if (repo.size < 1000000 && repo.complexity > 50) {
      return true;
    }

    // Check for package.json with library-like structure
    const hasLibraryFrameworks = repo.frameworks.some((fw) =>
      ["npm", "yarn", "webpack", "rollup", "babel"].includes(fw.toLowerCase())
    );
    if (hasLibraryFrameworks && repo.size < 5000000) {
      return true;
    }

    return false;
  }

  /**
   * Determines if a repository is likely an application
   *
   * @param repo - Repository to check
   * @returns True if repository is likely an application
   */
  private isApplicationRepo(repo: IndexedRepository): boolean {
    // Check for application indicators in name
    const appKeywords = [
      "app",
      "application",
      "client",
      "server",
      "service",
      "platform",
      "system",
    ];
    if (
      appKeywords.some((keyword) => repo.name.toLowerCase().includes(keyword))
    ) {
      return true;
    }

    // Applications typically have more files and moderate complexity
    if (repo.size > 1000000 && repo.complexity < 80) {
      return true;
    }

    // Check for application frameworks
    const appFrameworks = [
      "express",
      "nest",
      "django",
      "flask",
      "spring",
      "rails",
      "laravel",
    ];
    if (
      repo.frameworks.some((fw) => appFrameworks.includes(fw.toLowerCase()))
    ) {
      return true;
    }

    return false;
  }

  /**
   * Determines if a repository is likely a mobile application
   *
   * @param repo - Repository to check
   * @returns True if repository is likely a mobile application
   */
  private isMobileRepo(repo: IndexedRepository): boolean {
    // Check for mobile indicators in name
    const mobileKeywords = ["mobile", "ios", "android", "app", "native"];
    if (
      mobileKeywords.some((keyword) =>
        repo.name.toLowerCase().includes(keyword)
      )
    ) {
      return true;
    }

    // Check for mobile languages
    const mobileLanguages = ["swift", "kotlin", "java", "dart", "objective-c"];
    if (
      repo.languages.some((lang) =>
        mobileLanguages.includes(lang.toLowerCase())
      )
    ) {
      return true;
    }

    // Check for mobile frameworks
    const mobileFrameworks = [
      "react-native",
      "flutter",
      "ionic",
      "xamarin",
      "cordova",
    ];
    if (
      repo.frameworks.some((fw) =>
        mobileFrameworks.some((mobileFw) => fw.toLowerCase().includes(mobileFw))
      )
    ) {
      return true;
    }

    return false;
  }

  /**
   * Determines if a repository is likely a tool or utility
   *
   * @param repo - Repository to check
   * @returns True if repository is likely a tool
   */
  private isToolRepo(repo: IndexedRepository): boolean {
    // Check for tool indicators in name
    const toolKeywords = [
      "tool",
      "cli",
      "script",
      "automation",
      "build",
      "deploy",
      "test",
      "lint",
    ];
    if (
      toolKeywords.some((keyword) => repo.name.toLowerCase().includes(keyword))
    ) {
      return true;
    }

    // Check for tool indicators in tags
    const toolTags = repo.tags.filter((tag) =>
      ["tool", "cli", "automation", "build", "deployment"].some((indicator) =>
        tag.toLowerCase().includes(indicator)
      )
    );
    if (toolTags.length > 0) {
      return true;
    }

    // Tools are typically smaller and focused
    if (repo.size < 500000 && repo.complexity < 30) {
      return true;
    }

    return false;
  }

  /**
   * Adds a tag to a repository
   *
   * @param repoId - Repository ID to tag
   * @param tagName - Tag name to add
   * @param category - Optional tag category
   * @param color - Optional tag color
   * @returns Promise resolving when tag is added
   */
  public async addRepositoryTag(
    repoId: string,
    tagName: string,
    category?: string,
    color?: string
  ): Promise<void> {
    // Find repository in index
    const repoIndex = this.index.repositories.findIndex(
      (repo) => repo.id === repoId
    );

    if (repoIndex < 0) {
      throw new Error(`Repository with ID ${repoId} not found in index`);
    }

    // Check if tag already exists in repository
    if (!this.index.repositories[repoIndex].tags.includes(tagName)) {
      this.index.repositories[repoIndex].tags.push(tagName);
    }

    // Check if tag exists in global tags
    let tagExists = false;
    for (const tag of this.index.tags) {
      if (tag.name === tagName) {
        tagExists = true;
        break;
      }
    }

    // Add tag to global tags if it doesn't exist
    if (!tagExists) {
      this.index.tags.push({
        id: uuidv4(),
        name: tagName,
        category,
        color,
      });
    }

    // Update index timestamp
    this.index.lastUpdated = new Date();

    // Save index to disk
    await this.saveIndex();
  }

  /**
   * Removes a repository from the index
   *
   * @param repositoryId - Repository ID to remove
   * @returns Promise resolving when repository is removed
   */
  public async removeRepository(repositoryId: string): Promise<void> {
    // Find repository in index
    const repoIndex = this.index.repositories.findIndex(
      (repo) => repo.id === repositoryId
    );

    if (repoIndex < 0) {
      throw new Error(`Repository with ID ${repositoryId} not found`);
    }

    // Remove repository from index
    this.index.repositories.splice(repoIndex, 1);

    // Remove any relationships involving this repository
    this.index.relationships = this.index.relationships.filter(
      (rel) => rel.sourceId !== repositoryId && rel.targetId !== repositoryId
    );

    // Update index timestamp
    this.index.lastUpdated = new Date();

    // Save index to disk
    await this.saveIndex();
  }

  /**
   * Removes a tag from a repository
   *
   * @param repoId - Repository ID to remove tag from
   * @param tagName - Tag name to remove
   * @returns Promise resolving when tag is removed
   */
  public async removeRepositoryTag(
    repoId: string,
    tagName: string
  ): Promise<void> {
    // Find repository in index
    const repoIndex = this.index.repositories.findIndex(
      (repo) => repo.id === repoId
    );

    if (repoIndex < 0) {
      throw new Error(`Repository with ID ${repoId} not found in index`);
    }

    // Check if tag exists
    const repository = this.index.repositories[repoIndex];
    if (!repository.tags.includes(tagName)) {
      throw new Error(`Tag "${tagName}" not found on repository ${repoId}`);
    }

    // Remove tag from repository
    repository.tags = repository.tags.filter((tag) => tag !== tagName);

    // Update index timestamp
    this.index.lastUpdated = new Date();

    // Save index to disk
    await this.saveIndex();
  }

  /**
   * Gets all available tags in the index
   *
   * @returns Array of all tags
   */
  public getTags(): Tag[] {
    return this.index.tags;
  }

  /**
   * Adds a new global tag
   *
   * @param name - Tag name
   * @param category - Optional tag category
   * @param color - Optional tag color
   * @returns Newly created tag
   */
  public async addTag(
    name: string,
    category?: string,
    color?: string
  ): Promise<Tag> {
    // Check if tag already exists (same name and category)
    const existingTag = this.index.tags.find(
      (tag) => tag.name === name && tag.category === category
    );

    if (existingTag) {
      return existingTag;
    }

    // Create new tag
    const newTag: Tag = {
      id: uuidv4(),
      name,
      category,
      color,
    };

    // Add to tags list
    this.index.tags.push(newTag);

    // Update index timestamp
    this.index.lastUpdated = new Date();

    // Save index to disk
    await this.saveIndex();

    return newTag;
  }

  /**
   * Removes a global tag and from all repositories
   *
   * @param tagId - Tag ID to remove
   * @returns Promise resolving when tag is removed
   */
  public async removeTag(tagId: string): Promise<void> {
    // Find tag
    const tag = this.index.tags.find((t) => t.id === tagId);

    if (!tag) {
      throw new Error(`Tag with ID ${tagId} not found`);
    }

    // Remove tag from all repositories
    for (const repo of this.index.repositories) {
      repo.tags = repo.tags.filter((t) => t !== tag.name);
    }

    // Remove tag from global list
    this.index.tags = this.index.tags.filter((t) => t.id !== tagId);

    // Update index timestamp
    this.index.lastUpdated = new Date();

    // Save index to disk
    await this.saveIndex();
  }
}
