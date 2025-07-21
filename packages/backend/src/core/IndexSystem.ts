/**
 * Repository indexing and search system
 */

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import {
  RepositoryAnalysis,
  SearchQuery,
  SearchResult,
  CombinationSuggestion,
} from '@unified-repo-analyzer/shared/src/types/analysis';
import {
  IndexedRepository,
  RepositoryRelationship,
  Tag,
} from '@unified-repo-analyzer/shared/src/types/repository';

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
  private index: RepositoryIndex;
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
        const indexData = fs.readFileSync(this.indexPath, 'utf8');
        const loadedIndex = JSON.parse(indexData);

        // Convert string dates back to Date objects
        if (loadedIndex.lastUpdated) {
          loadedIndex.lastUpdated = new Date(loadedIndex.lastUpdated);
        }

        if (loadedIndex.repositories) {
          loadedIndex.repositories.forEach((repo: any) => {
            if (repo.lastAnalyzed) {
              repo.lastAnalyzed = new Date(repo.lastAnalyzed);
            }
          });
        }

        this.index = loadedIndex;
      } catch (error) {
        console.error('Failed to load index file:', error);
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
  public async updateRepository(repoId: string, analysis: RepositoryAnalysis): Promise<void> {
    // Extract metadata from analysis
    const updatedRepo = this.extractRepositoryMetadata(analysis);

    // Ensure ID matches
    updatedRepo.id = repoId;

    // Find repository in index
    const existingIndex = this.index.repositories.findIndex((repo) => repo.id === repoId);

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
    // Start with all repositories
    let results = this.index.repositories.map((repo) => ({
      repository: repo,
      score: 0,
      matches: [] as { field: string; value: string; score: number }[],
    }));

    // Filter by languages if specified
    if (query.languages && query.languages.length > 0) {
      results = results.filter((result) =>
        query.languages!.some((lang) => result.repository.languages.includes(lang))
      );

      // Add language matches to results
      results.forEach((result) => {
        const matchedLanguages = query.languages!.filter((lang) =>
          result.repository.languages.includes(lang)
        );

        if (matchedLanguages.length > 0) {
          result.matches.push({
            field: 'languages',
            value: matchedLanguages.join(', '),
            score: matchedLanguages.length * 10,
          });

          result.score += matchedLanguages.length * 10;
        }
      });
    }

    // Filter by frameworks if specified
    if (query.frameworks && query.frameworks.length > 0) {
      results = results.filter((result) =>
        query.frameworks!.some((framework) => result.repository.frameworks.includes(framework))
      );

      // Add framework matches to results
      results.forEach((result) => {
        const matchedFrameworks = query.frameworks!.filter((framework) =>
          result.repository.frameworks.includes(framework)
        );

        if (matchedFrameworks.length > 0) {
          result.matches.push({
            field: 'frameworks',
            value: matchedFrameworks.join(', '),
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
        return query.keywords!.some(
          (keyword) =>
            result.repository.name.toLowerCase().includes(keyword.toLowerCase()) ||
            result.repository.summary.toLowerCase().includes(keyword.toLowerCase()) ||
            result.repository.tags.some((tag) => tag.toLowerCase().includes(keyword.toLowerCase()))
        );
      });

      // Add keyword matches to results
      results.forEach((result) => {
        query.keywords!.forEach((keyword) => {
          const lowerKeyword = keyword.toLowerCase();

          // Check name match
          if (result.repository.name.toLowerCase().includes(lowerKeyword)) {
            result.matches.push({
              field: 'name',
              value: result.repository.name,
              score: 20,
            });
            result.score += 20;
          }

          // Check summary match
          if (result.repository.summary.toLowerCase().includes(lowerKeyword)) {
            result.matches.push({
              field: 'summary',
              value: `...${result.repository.summary.substring(
                Math.max(0, result.repository.summary.toLowerCase().indexOf(lowerKeyword) - 20),
                Math.min(
                  result.repository.summary.length,
                  result.repository.summary.toLowerCase().indexOf(lowerKeyword) +
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
              field: 'tags',
              value: matchedTags.join(', '),
              score: matchedTags.length * 10,
            });
            result.score += matchedTags.length * 10;
          }
        });
      });
    }

    // Filter by file types if specified
    if (query.fileTypes && query.fileTypes.length > 0) {
      // We can use tags as a proxy for file types
      // Repositories with certain file types often have related tags
      results = results.filter((result) => {
        return query.fileTypes!.some((fileType) => {
          // Check if any tag contains the file type
          return result.repository.tags.some((tag) =>
            tag.toLowerCase().includes(fileType.toLowerCase().replace('.', ''))
          );
        });
      });

      // Add file type matches to results
      results.forEach((result) => {
        const matchedFileTypes = query.fileTypes!.filter((fileType) => {
          return result.repository.tags.some((tag) =>
            tag.toLowerCase().includes(fileType.toLowerCase().replace('.', ''))
          );
        });

        if (matchedFileTypes.length > 0) {
          result.matches.push({
            field: 'fileTypes',
            value: matchedFileTypes.join(', '),
            score: matchedFileTypes.length * 5,
          });

          result.score += matchedFileTypes.length * 5;
        }
      });
    }

    // Filter by date range if specified
    if (query.dateRange) {
      results = results.filter(
        (result) =>
          result.repository.lastAnalyzed >= query.dateRange!.start &&
          result.repository.lastAnalyzed <= query.dateRange!.end
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
  public async findSimilarRepositories(repoId: string): Promise<RepositoryMatch[]> {
    // Find repository in index
    const repository = this.index.repositories.find((repo) => repo.id === repoId);

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
      const otherRepo = this.index.repositories.find((repo) => repo.id === otherRepoId);

      if (!otherRepo) {
        throw new Error(`Related repository with ID ${otherRepoId} not found in index`);
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
  public async suggestCombinations(repoIds: string[]): Promise<CombinationSuggestion[]> {
    // Validate repository IDs
    const repositories = repoIds.map((id) => {
      const repo = this.index.repositories.find((r) => r.id === id);
      if (!repo) {
        throw new Error(`Repository with ID ${id} not found in index`);
      }
      return repo;
    });

    // For now, we'll just suggest combinations based on language compatibility
    const suggestions: CombinationSuggestion[] = [];

    // Check for frontend-backend combinations
    const frontendRepos = repositories.filter((repo) =>
      repo.frameworks.some((fw) => ['react', 'vue', 'angular'].includes(fw.toLowerCase()))
    );

    const backendRepos = repositories.filter((repo) =>
      repo.frameworks.some((fw) =>
        ['express', 'nest', 'django', 'flask', 'spring'].includes(fw.toLowerCase())
      )
    );

    // Suggest frontend-backend combinations
    for (const frontend of frontendRepos) {
      for (const backend of backendRepos) {
        if (frontend.id !== backend.id) {
          suggestions.push({
            repositories: [frontend.id, backend.id],
            compatibility: 0.8,
            rationale: `Frontend (${frontend.name}) and backend (${backend.name}) could be integrated into a full-stack application.`,
            integrationPoints: [
              'API integration between frontend and backend',
              'Shared data models and validation',
              'Authentication and authorization flow',
            ],
          });
        }
      }
    }

    // Check for complementary libraries
    // This is a simplified example - real implementation would be more sophisticated
    for (let i = 0; i < repositories.length; i++) {
      for (let j = i + 1; j < repositories.length; j++) {
        const repoA = repositories[i];
        const repoB = repositories[j];

        // Check for complementary languages
        const sharedLanguages = repoA.languages.filter((lang) => repoB.languages.includes(lang));

        if (sharedLanguages.length > 0) {
          suggestions.push({
            repositories: [repoA.id, repoB.id],
            compatibility: 0.6 + sharedLanguages.length * 0.1,
            rationale: `Repositories share ${sharedLanguages.length} languages: ${sharedLanguages.join(', ')}`,
            integrationPoints: [
              'Shared code libraries and utilities',
              'Common build and test infrastructure',
              'Unified deployment pipeline',
            ],
          });
        }
      }
    }

    return suggestions;
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
      fs.writeFileSync(this.indexPath, JSON.stringify(this.index, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save index file:', error);
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
  private extractRepositoryMetadata(analysis: RepositoryAnalysis): IndexedRepository {
    // Calculate complexity score (simplified)
    const complexity =
      analysis.codeAnalysis.complexity?.maintainabilityIndex ||
      (analysis.fileCount > 0
        ? (analysis.codeAnalysis.functionCount + analysis.codeAnalysis.classCount) /
          analysis.fileCount
        : 0);

    // Extract tags from analysis
    const tags: string[] = [];

    // Add language tags
    analysis.languages.forEach((lang) => tags.push(`lang:${lang}`));

    // Add framework tags
    analysis.frameworks.forEach((fw) => tags.push(`framework:${fw}`));

    // Add complexity tag
    if (complexity < 30) tags.push('complexity:low');
    else if (complexity < 70) tags.push('complexity:medium');
    else tags.push('complexity:high');

    // Create indexed repository
    return {
      id: analysis.id,
      name: analysis.name,
      path: analysis.path,
      languages: analysis.languages,
      frameworks: analysis.frameworks,
      tags,
      summary: analysis.description || analysis.insights.executiveSummary.substring(0, 200),
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
  private async detectRelationships(repository: IndexedRepository): Promise<void> {
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
  private async updateRelationships(repository: IndexedRepository): Promise<void> {
    // Simply re-detect relationships
    await this.detectRelationships(repository);
  }

  /**
   * Calculates similarity between two repositories
   *
   * @param repoA - First repository
   * @param repoB - Second repository
   * @returns Similarity score and type
   */
  private calculateSimilarity(
    repoA: IndexedRepository,
    repoB: IndexedRepository
  ): { score: number; type: 'similar' | 'complementary' | 'dependency' | 'fork'; reason: string } {
    let score = 0;
    let reasons: string[] = [];

    // Check language similarity
    const sharedLanguages = repoA.languages.filter((lang) => repoB.languages.includes(lang));

    if (sharedLanguages.length > 0) {
      const languageScore =
        sharedLanguages.length / Math.max(repoA.languages.length, repoB.languages.length);
      score += languageScore * 0.3; // Languages contribute 30% to similarity
      reasons.push(`Shares ${sharedLanguages.length} languages: ${sharedLanguages.join(', ')}`);
    }

    // Check framework similarity
    const sharedFrameworks = repoA.frameworks.filter((fw) => repoB.frameworks.includes(fw));

    if (sharedFrameworks.length > 0) {
      const frameworkScore =
        sharedFrameworks.length / Math.max(repoA.frameworks.length, repoB.frameworks.length);
      score += frameworkScore * 0.25; // Frameworks contribute 25% to similarity
      reasons.push(`Shares ${sharedFrameworks.length} frameworks: ${sharedFrameworks.join(', ')}`);
    }

    // Check tag similarity
    const sharedTags = repoA.tags.filter((tag) => repoB.tags.includes(tag));

    if (sharedTags.length > 0) {
      const tagScore = sharedTags.length / Math.max(repoA.tags.length, repoB.tags.length);
      score += tagScore * 0.15; // Tags contribute 15% to similarity
      reasons.push(`Shares ${sharedTags.length} tags: ${sharedTags.join(', ')}`);
    }

    // Check name similarity (potential fork)
    if (
      repoA.name.toLowerCase().includes(repoB.name.toLowerCase()) ||
      repoB.name.toLowerCase().includes(repoA.name.toLowerCase())
    ) {
      score += 0.1; // Name similarity contributes 10%
      reasons.push('Similar repository names');
    }

    // Check size similarity
    const sizeRatio = Math.min(repoA.size, repoB.size) / Math.max(repoA.size, repoB.size);
    if (sizeRatio > 0.7) {
      score += sizeRatio * 0.1; // Size similarity contributes up to 10%
      reasons.push('Similar repository sizes');
    }

    // Check complexity similarity
    const complexityRatio =
      Math.min(repoA.complexity, repoB.complexity) / Math.max(repoA.complexity, repoB.complexity);
    if (complexityRatio > 0.7) {
      score += complexityRatio * 0.1; // Complexity similarity contributes up to 10%
      reasons.push('Similar complexity profiles');
    }

    // Determine relationship type
    let type: 'similar' | 'complementary' | 'dependency' | 'fork' = 'similar';

    // Check for potential fork
    if (
      (score > 0.8 && repoA.name.toLowerCase().includes(repoB.name.toLowerCase())) ||
      repoB.name.toLowerCase().includes(repoA.name.toLowerCase())
    ) {
      type = 'fork';
    }
    // Check for complementary repositories (frontend-backend pairs)
    else if (
      (this.isBackendRepo(repoA) && this.isFrontendRepo(repoB)) ||
      (this.isFrontendRepo(repoA) && this.isBackendRepo(repoB))
    ) {
      type = 'complementary';
      score = Math.max(score, 0.6); // Boost score for complementary repos
      reasons.push('Frontend-Backend complementary pair');
    }
    // Check for potential dependency relationship
    else if (
      (this.isLibraryRepo(repoA) && !this.isLibraryRepo(repoB)) ||
      (this.isLibraryRepo(repoB) && !this.isLibraryRepo(repoA))
    ) {
      type = 'dependency';
      reasons.push('Library-Application potential dependency');
    }
    // Default to similar for high scores
    else if (score > 0.6) {
      type = 'similar';
    }
    // Lower scores with shared languages are complementary
    else if (sharedLanguages.length > 0) {
      type = 'complementary';
    }

    return {
      score,
      type,
      reason: reasons.join('. '),
    };
  }

  /**
   * Determines if a repository is likely a frontend application
   *
   * @param repo - Repository to check
   * @returns True if repository is likely a frontend application
   */
  private isFrontendRepo(repo: IndexedRepository): boolean {
    const frontendFrameworks = ['react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt'];
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
    const backendFrameworks = ['express', 'nest', 'django', 'flask', 'spring', 'rails', 'laravel'];
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
    const libraryKeywords = ['lib', 'library', 'sdk', 'toolkit', 'util', 'helper', 'common'];
    if (libraryKeywords.some((keyword) => repo.name.toLowerCase().includes(keyword))) {
      return true;
    }

    // Libraries often have fewer files but higher complexity
    if (repo.size < 1000000 && repo.complexity > 50) {
      return true;
    }

    return false;
  }
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
    const repoIndex = this.index.repositories.findIndex((repo) => repo.id === repoId);
    
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
   * Removes a tag from a repository
   * 
   * @param repoId - Repository ID to remove tag from
   * @param tagName - Tag name to remove
   * @returns Promise resolving when tag is removed
   */
  public async removeRepositoryTag(repoId: string, tagName: string): Promise<void> {
    // Find repository in index
    const repoIndex = this.index.repositories.findIndex((repo) => repo.id === repoId);
    
    if (repoIndex < 0) {
      throw new Error(`Repository with ID ${repoId} not found in index`);
    }
    
    // Remove tag from repository
    this.index.repositories[repoIndex].tags = 
      this.index.repositories[repoIndex].tags.filter((tag) => tag !== tagName);
    
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
  public async addTag(name: string, category?: string, color?: string): Promise<Tag> {
    // Check if tag already exists
    const existingTag = this.index.tags.find((tag) => tag.name === name);
    
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