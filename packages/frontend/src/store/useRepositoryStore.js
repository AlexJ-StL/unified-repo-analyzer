import { create } from 'zustand';
export const useRepositoryStore = create((set) => ({
    repositories: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    filters: {
        languages: [],
        frameworks: [],
    },
    setRepositories: (repositories) => set({ repositories }),
    addRepository: (repository) => set((state) => ({
        repositories: [...state.repositories, repository],
    })),
    removeRepository: (id) => set((state) => ({
        repositories: state.repositories.filter((repo) => repo.id !== id),
    })),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
    })),
    clearFilters: () => set({
        filters: {
            languages: [],
            frameworks: [],
        },
    }),
}));
//# sourceMappingURL=useRepositoryStore.js.map