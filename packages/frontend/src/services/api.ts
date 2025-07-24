import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;

    // Handle specific error codes
    if (response) {
      switch (response.status) {
        case 401:
          // Handle unauthorized
          console.error('Unauthorized access');
          break;
        case 403:
          // Handle forbidden
          console.error('Forbidden access');
          break;
        case 404:
          // Handle not found
          console.error('Resource not found');
          break;
        case 500:
          // Handle server error
          console.error('Server error');
          break;
        default:
          // Handle other errors
          console.error(`Error: ${response.status}`);
          break;
      }
    } else {
      // Handle network errors
      console.error('Network error - check your connection');
    }

    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Repository analysis
  analyzeRepository: (path: string, options: any) => {
    return api.post('/analyze', { path, options });
  },

  // Batch analysis
  analyzeBatch: (paths: string[], options: any) => {
    return api.post('/analyze/batch', { paths, options });
  },

  // Get repositories
  getRepositories: () => {
    return api.get('/repositories');
  },

  // Search repositories
  searchRepositories: (query: string, filters: any) => {
    return api.get('/repositories/search', { params: { query, ...filters } });
  },

  // Get analysis results
  getAnalysis: (id: string) => {
    return api.get(`/analysis/${id}`);
  },

  // Export analysis
  exportAnalysis: (id: string, format: string) => {
    return api.post('/export', { id, format }, { responseType: 'blob' });
  },

  // Cancel analysis
  cancelAnalysis: (id: string) => {
    return api.post(`/analysis/${id}/cancel`);
  },
};

// Error handling helper
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const data = axiosError.response.data as any;
      return (
        data.message || `Error ${axiosError.response.status}: ${axiosError.response.statusText}`
      );
    } else if (axiosError.request) {
      // The request was made but no response was received
      return 'No response received from server. Please check your connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      return `Error: ${axiosError.message}`;
    }
  }

  // For non-axios errors
  return error instanceof Error ? error.message : 'An unknown error occurred';
};

export default api;
