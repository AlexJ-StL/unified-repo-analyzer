import { create } from 'zustand';
const defaultOptions = {
    mode: 'standard',
    maxFiles: 100,
    maxLinesPerFile: 1000,
    includeLLMAnalysis: true,
    llmProvider: 'claude',
    outputFormats: ['json'],
    includeTree: true,
};
const defaultProgress = {
    status: 'idle',
    currentStep: '',
    progress: 0,
    totalSteps: 0,
};
export const useAnalysisStore = create((set) => ({
    repositoryPath: '',
    options: defaultOptions,
    progress: defaultProgress,
    results: null,
    setRepositoryPath: (path) => set({ repositoryPath: path }),
    setOptions: (options) => set((state) => ({
        options: { ...state.options, ...options },
    })),
    setProgress: (progress) => set((state) => ({
        progress: { ...state.progress, ...progress },
    })),
    setResults: (results) => set({ results }),
    resetAnalysis: () => set({
        repositoryPath: '',
        options: defaultOptions,
        progress: defaultProgress,
        results: null,
    }),
}));
//# sourceMappingURL=useAnalysisStore.js.map