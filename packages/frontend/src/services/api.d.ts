declare const api: import('axios').AxiosInstance;

export declare const apiService: {
  analyzeRepository: (
    path: string,
    options: unknown
  ) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  analyzeBatch: (
    paths: string[],
    options: unknown
  ) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  getRepositories: () => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  searchRepositories: (
    query: string,
    filters: unknown
  ) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  getAnalysis: (id: string) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  exportAnalysis: (
    analysis: unknown,
    format: string,
    download?: boolean
  ) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  exportBatchAnalysis: (
    batchAnalysis: unknown,
    format: string,
    download?: boolean
  ) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  downloadExport: (exportId: string) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  getExportHistory: () => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  deleteExport: (exportId: string) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  cancelAnalysis: (id: string) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
};

export declare const handleApiError: (error: unknown) => string;

export declare const createApiService: (onError?: (error: unknown) => void) => {
  analyzeRepository: (
    path: string,
    options: unknown
  ) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  analyzeBatch: (
    paths: string[],
    options: unknown
  ) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  getRepositories: () => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  searchRepositories: (
    query: string,
    filters: unknown
  ) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  getAnalysis: (id: string) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  exportAnalysis: (
    analysis: unknown,
    format: string,
    download?: boolean
  ) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  exportBatchAnalysis: (
    batchAnalysis: unknown,
    format: string,
    download?: boolean
  ) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  downloadExport: (exportId: string) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  getExportHistory: () => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  deleteExport: (exportId: string) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
  cancelAnalysis: (id: string) => Promise<import('axios').AxiosResponse<unknown, unknown>>;
};

export default api;
