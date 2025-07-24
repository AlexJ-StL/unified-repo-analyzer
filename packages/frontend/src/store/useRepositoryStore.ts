import { create } from 'zustand';

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

export const useRepositoryStore = create<RepositoryState>((set) => ({
  repositories: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: {
    languages: [],
    frameworks: [],
  },

  setRepositories: (repositories) => set({ repositories }),

  addRepository: (repository) =>
    set((state) => ({
      repositories: [...state.repositories, repository],
    })),

  removeRepository: (id) =>
    set((state) => ({
      repositories: state.repositories.filter((repo) => repo.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  clearFilters: () =>
    set({
      filters: {
        languages: [],
        frameworks: [],
      },
    }),
}));
