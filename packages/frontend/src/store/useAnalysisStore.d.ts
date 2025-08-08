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
export declare const useAnalysisStore: import('zustand').UseBoundStore<
  import('zustand').StoreApi<AnalysisState>
>;
