declare const api: import('axios').AxiosInstance;
export declare const apiService: {
  analyzeRepository: (
    path: string,
    options: any
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  analyzeBatch: (paths: string[], options: any) => Promise<import('axios').AxiosResponse<any, any>>;
  getRepositories: () => Promise<import('axios').AxiosResponse<any, any>>;
  searchRepositories: (
    query: string,
    filters: any
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  getAnalysis: (id: string) => Promise<import('axios').AxiosResponse<any, any>>;
  exportAnalysis: (
    analysis: any,
    format: string,
    download?: boolean
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  exportBatchAnalysis: (
    batchAnalysis: any,
    format: string,
    download?: boolean
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  downloadExport: (exportId: string) => Promise<import('axios').AxiosResponse<any, any>>;
  getExportHistory: () => Promise<import('axios').AxiosResponse<any, any>>;
  deleteExport: (exportId: string) => Promise<import('axios').AxiosResponse<any, any>>;
  cancelAnalysis: (id: string) => Promise<import('axios').AxiosResponse<any, any>>;
};
export declare const handleApiError: (error: unknown) => string;
export declare const createApiService: (onError?: (error: any) => void) => {
  analyzeRepository: (
    path: string,
    options: any
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  analyzeBatch: (paths: string[], options: any) => Promise<import('axios').AxiosResponse<any, any>>;
  getRepositories: () => Promise<import('axios').AxiosResponse<any, any>>;
  searchRepositories: (
    query: string,
    filters: any
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  getAnalysis: (id: string) => Promise<import('axios').AxiosResponse<any, any>>;
  exportAnalysis: (
    analysis: any,
    format: string,
    download?: boolean
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  exportBatchAnalysis: (
    batchAnalysis: any,
    format: string,
    download?: boolean
  ) => Promise<import('axios').AxiosResponse<any, any>>;
  downloadExport: (exportId: string) => Promise<import('axios').AxiosResponse<any, any>>;
  getExportHistory: () => Promise<import('axios').AxiosResponse<any, any>>;
  deleteExport: (exportId: string) => Promise<import('axios').AxiosResponse<any, any>>;
  cancelAnalysis: (id: string) => Promise<import('axios').AxiosResponse<any, any>>;
};
export default api;
