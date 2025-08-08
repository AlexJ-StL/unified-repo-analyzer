import type { RepositoryAnalysis } from '@unified-repo-analyzer/shared';
import { create } from 'zustand';

export interface AnalysisOptions {
  mode: 'quick' | 'standard' | 'comprehensive';
  maxFiles: number;
  maxLinesPerFile: number;
  includeLLMAnalysis: boolean;
  llmProvider: string;
  outputFormats: string[];
  includeTree: boolean;
}

export interface AnalysisProgress {
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentStep: string;
  progress: number;
  totalSteps: number;
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
  outputFormats: ['json'],
  includeTree: true,
};

const defaultProgress: AnalysisProgress = {
  status: 'idle',
  currentStep: '',
  progress: 0,
  totalSteps: 0,
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
