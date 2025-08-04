export interface Repository {
  id: string;
  name: string;
  path: string;
  description?: string;
  languages: string[];
  frameworks: string[];
  lastAnalyzed: string;
  size: number;
}
interface RepositoryState {
  repositories: Repository[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    languages: string[];
    frameworks: string[];
  };
  setRepositories: (repositories: Repository[]) => void;
  addRepository: (repository: Repository) => void;
  removeRepository: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<RepositoryState['filters']>) => void;
  clearFilters: () => void;
}
export declare const useRepositoryStore: import('zustand').UseBoundStore<
  import('zustand').StoreApi<RepositoryState>
>;
