/**
 * Repository indexing and search system
 */
import { RepositoryAnalysis, SearchQuery, SearchResult, CombinationSuggestion } from '@unified-repo-analyzer/shared/src/types/analysis';
import { IndexedRepository, RepositoryRelationship, Tag } from '@unified-repo-analyzer/shared/src/types/repository';
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
export declare class IndexSystem {
    private index;
    private indexPath;
    /**
     * Creates a new IndexSystem instance
     *
     * @param indexPath - Optional path to store the index file
     */
    constructor(indexPath?: string);
    /**
     * Initializes an empty index
     */
    private initializeEmptyIndex;
    /**
     * Adds a repository to the index
     *
     * @param analysis - Repository analysis to add to the index
     * @returns Promise resolving when repository is added
     */
    addRepository(analysis: RepositoryAnalysis): Promise<void>;
    /**
     * Updates an existing repository in the index
     *
     * @param repoId - Repository ID to update
     * @param analysis - Updated repository analysis
     * @returns Promise resolving when repository is updated
     */
    updateRepository(repoId: string, analysis: RepositoryAnalysis): Promise<void>;
    /**
     * Searches repositories based on query criteria
     *
     * @param query - Search query parameters
     * @returns Promise resolving to search results
     */
    searchRepositories(query: SearchQuery): Promise<SearchResult[]>;
    /**
     * Finds similar repositories to the specified repository
     *
     * @param repoId - Repository ID to find similar repositories for
     * @returns Promise resolving to repository matches
     */
    findSimilarRepositories(repoId: string): Promise<RepositoryMatch[]>;
    /**
     * Suggests combinations of repositories that could work well together
     *
     * @param repoIds - Repository IDs to suggest combinations for
     * @returns Promise resolving to combination suggestions
     */
    suggestCombinations(repoIds: string[]): Promise<CombinationSuggestion[]>;
    /**
     * Generates all combinations of repositories of a given size
     */
    private generateCombinations;
    /**
     * Analyzes a combination of repositories for compatibility
     */
    private analyzeCombination;
    /**
     * Analyzes architectural compatibility between repositories
     */
    private analyzeArchitecturalCompatibility;
    /**
     * Analyzes technology stack synergy
     */
    private analyzeTechStackSynergy;
    /**
     * Analyzes functionality complementarity
     */
    private analyzeFunctionalityComplementarity;
    /**
     * Analyzes development workflow compatibility
     */
    private analyzeWorkflowCompatibility;
    /**
     * Infers the purpose of a repository based on its characteristics
     */
    private inferRepositoryPurpose;
    /**
     * Gets the current repository index
     *
     * @returns Current repository index
     */
    getIndex(): RepositoryIndex;
    /**
     * Sets the repository index (useful for loading from persistent storage)
     *
     * @param index - Repository index to set
     */
    setIndex(index: RepositoryIndex): void;
    /**
     * Saves the index to disk if a path is configured
     *
     * @returns Promise resolving when index is saved
     */
    saveIndex(): Promise<void>;
    /**
     * Sets the path for index persistence
     *
     * @param indexPath - Path to store the index file
     */
    setIndexPath(indexPath: string): void;
    /**
     * Extracts repository metadata from analysis for indexing
     *
     * @param analysis - Repository analysis
     * @returns Indexed repository metadata
     */
    private extractRepositoryMetadata;
    /**
     * Detects relationships between repositories
     *
     * @param repository - Repository to detect relationships for
     * @returns Promise resolving when relationships are detected
     */
    private detectRelationships;
    /**
     * Updates relationships for a repository
     *
     * @param repository - Repository to update relationships for
     * @returns Promise resolving when relationships are updated
     */
    private updateRelationships;
    /**
     * Calculates similarity between two repositories using advanced algorithms
     *
     * @param repoA - First repository
     * @param repoB - Second repository
     * @returns Similarity score and type
     */
    private calculateSimilarity;
    /**
     * Calculates language similarity with weighted scoring
     */
    private calculateLanguageSimilarity;
    /**
     * Calculates framework compatibility
     */
    private calculateFrameworkCompatibility;
    /**
     * Calculates architectural pattern similarity
     */
    private calculateArchitecturalSimilarity;
    /**
     * Calculates technology stack compatibility
     */
    private calculateTechStackCompatibility;
    /**
     * Calculates project structure similarity
     */
    private calculateStructureSimilarity;
    /**
     * Calculates semantic similarity based on names and descriptions
     */
    private calculateSemanticSimilarity;
    /**
     * Determines the relationship type based on analysis
     */
    private determineRelationshipType;
    /**
     * Checks if two repositories are complementary
     */
    private areComplementaryRepositories;
    /**
     * Checks if there's a dependency relationship
     */
    private isDependencyRelationship;
    /**
     * Determines if a repository is likely a frontend application
     *
     * @param repo - Repository to check
     * @returns True if repository is likely a frontend application
     */
    private isFrontendRepo;
    /**
     * Determines if a repository is likely a backend application
     *
     * @param repo - Repository to check
     * @returns True if repository is likely a backend application
     */
    private isBackendRepo;
    /**
     * Determines if a repository is likely a library or utility
     *
     * @param repo - Repository to check
     * @returns True if repository is likely a library
     */
    private isLibraryRepo;
    /**
     * Determines if a repository is likely an application
     *
     * @param repo - Repository to check
     * @returns True if repository is likely an application
     */
    private isApplicationRepo;
    /**
     * Determines if a repository is likely a mobile application
     *
     * @param repo - Repository to check
     * @returns True if repository is likely a mobile application
     */
    private isMobileRepo;
    /**
     * Determines if a repository is likely a tool or utility
     *
     * @param repo - Repository to check
     * @returns True if repository is likely a tool
     */
    private isToolRepo;
    /**
     * Adds a tag to a repository
     *
     * @param repoId - Repository ID to tag
     * @param tagName - Tag name to add
     * @param category - Optional tag category
     * @param color - Optional tag color
     * @returns Promise resolving when tag is added
     */
    addRepositoryTag(repoId: string, tagName: string, category?: string, color?: string): Promise<void>;
    /**
     * Removes a tag from a repository
     *
     * @param repoId - Repository ID to remove tag from
     * @param tagName - Tag name to remove
     * @returns Promise resolving when tag is removed
     */
    removeRepositoryTag(repoId: string, tagName: string): Promise<void>;
    /**
     * Gets all available tags in the index
     *
     * @returns Array of all tags
     */
    getTags(): Tag[];
    /**
     * Adds a new global tag
     *
     * @param name - Tag name
     * @param category - Optional tag category
     * @param color - Optional tag color
     * @returns Newly created tag
     */
    addTag(name: string, category?: string, color?: string): Promise<Tag>;
    /**
     * Removes a global tag and from all repositories
     *
     * @param tagId - Tag ID to remove
     * @returns Promise resolving when tag is removed
     */
    removeTag(tagId: string): Promise<void>;
}
