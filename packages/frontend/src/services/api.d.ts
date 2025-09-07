declare const api: import('axios').AxiosInstance;
export declare const apiService: {
  analyzeRepository: (
    path: string,
    options: unknown
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  analyzeBatch: (
    paths: string[],
    options: unknown
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  getRepositories: () => Promise<import('axios').AxiosResponse<any, any>>;
  searchRepositories: (
    query: string,
    filters: unknown
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  getAnalysis: (id: string) => Promise<import('axios').AxiosResponse<any, any>>;
  exportAnalysis: (
    analysis: unknown,
    format: string,
    download?: boolean
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  exportBatchAnalysis: (
    batchAnalysis: unknown,
    format: string,
    download?: boolean
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  downloadExport: (exportId: string) => Promise<import('axios').AxiosResponse<any, any>>;
  getExportHistory: () => Promise<import('axios').AxiosResponse<any, any>>;
  deleteExport: (exportId: string) => Promise<import('axios').AxiosResponse<any, any>>;
  cancelAnalysis: (id: string) => Promise<import('axios').AxiosResponse<any, any>>;
};
export declare const handleApiError: (error: unknown) => string;
export declare const createApiService: (onError?: (error: unknown) => void) => {
  analyzeRepository: (
    path: string,
    options: unknown
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  analyzeBatch: (
    paths: string[],
    options: unknown
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  getRepositories: () => Promise<import('axios').AxiosResponse<any, any>>;
  searchRepositories: (
    query: string,
    filters: unknown
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  getAnalysis: (id: string) => Promise<import('axios').AxiosResponse<any, any>>;
  exportAnalysis: (
    analysis: unknown,
    format: string,
    download?: boolean
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  exportBatchAnalysis: (
    batchAnalysis: unknown,
    format: string,
    download?: boolean
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  downloadExport: (exportId: string) => Promise<import('axios').AxiosResponse<any, any>>;
  getExportHistory: () => Promise<import('axios').AxiosResponse<any, any>>;
  deleteExport: (exportId: string) => Promise<import('axios').AxiosResponse<any, any>>;
  cancelAnalysis: (id: string) => Promise<import('axios').AxiosResponse<any, any>>;
};
export default api;
