import type {
  OutputFormat,
  RepositoryAnalysis,
  AnalysisOptions as SharedAnalysisOptions,
} from '@unified-repo-analyzer/shared';
import { create } from 'zustand';

export interface AnalysisOptions extends SharedAnalysisOptions {}

export interface AnalysisProgress {
  status: 'idle' | 'initializing' | 'processing' | 'completed' | 'failed';
  currentStep: string;
  progress: number;
  totalSteps: number;
  filesProcessed?: number;
  totalFiles?: number;
  timeElapsed?: number;
  timeRemaining?: number;
  tokensUsed?: number;
  error?: string;
  log?: string;
}

interface AnalysisState {
  repositoryPath: string;
  options: AnalysisOptions;
  progress: AnalysisProgress;
  results: RepositoryAnalysis | null;
  setRepositoryPath: (path: string) => void;
  setOptions: (options: Partial<AnalysisOptions>) => void;
  setProgress: (progress: Partial<AnalysisProgress>) => void;
  setResults: (results: RepositoryAnalysis | null) => void;
  resetAnalysis: () => void;
}

const defaultOptions: AnalysisOptions = {
  mode: 'standard',
  maxFiles: 100,
  maxLinesPerFile: 1000,
  includeLLMAnalysis: true,
  llmProvider: 'claude',
  outputFormats: ['json'] as OutputFormat[],
  includeTree: true,
};

const defaultProgress: AnalysisProgress = {
  status: 'idle',
  currentStep: '',
  progress: 0,
  totalSteps: 0,
  filesProcessed: 0,
  totalFiles: 0,
  timeElapsed: 0,
  timeRemaining: 0,
  tokensUsed: 0,
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  repositoryPath: '',
  options: defaultOptions,
  progress: defaultProgress,
  results: null,

  setRepositoryPath: (path) => set({ repositoryPath: path }),

  setOptions: (options) =>
    set((state) => ({
      options: { ...state.options, ...options },
    })),

  setProgress: (progress) =>
    set((state) => ({
      progress: { ...state.progress, ...progress },
    })),

  setResults: (results) => set({ results }),

  resetAnalysis: () =>
    set({
      repositoryPath: '',
      options: defaultOptions,
      progress: defaultProgress,
      results: null,
    }),
}));
