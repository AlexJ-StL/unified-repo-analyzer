import type {
	AnalysisOptions,
	BatchAnalysisResult,
	OutputFormat,
	RepositoryAnalysis,
	SearchQuery,
} from "@unified-repo-analyzer/shared";
import axios, { type AxiosError, type AxiosResponse } from "axios";
import { performanceService } from "./performance.service";

// Create axios instance with default config
const api = axios.create({
	baseURL: "http://localhost:3000/api",
	timeout: 30000, // 30 seconds
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor for API calls
api.interceptors.request.use(
	(config) => {
		// Add performance timing
		(config as typeof config & { metadata?: { startTime: number } }).metadata =
			{
				startTime: performance.now(),
			};

		// You can add auth tokens here if needed
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor for API calls
api.interceptors.response.use(
	(response) => {
		// Record API performance metrics
		const config = response.config as typeof response.config & {
			metadata?: { startTime: number };
		};
		if (config.metadata?.startTime) {
			const duration = performance.now() - config.metadata.startTime;
			const endpoint =
				config.url?.replace(config.baseURL || "", "") || "unknown";

			performanceService.recordApiCall(
				endpoint,
				config.method?.toUpperCase() || "GET",
				duration,
				response.status,
			);
		}

		return response;
	},
	(error: AxiosError) => {
		const { response, config } = error;

		// Record API performance metrics for errors
		const configWithMetadata = config as typeof config & {
			metadata?: { startTime: number };
		};
		if (config && configWithMetadata?.metadata?.startTime) {
			const duration =
				performance.now() - configWithMetadata.metadata.startTime;
			const endpoint =
				config.url?.replace(config.baseURL || "", "") || "unknown";

			performanceService.recordApiCall(
				endpoint,
				config.method?.toUpperCase() || "GET",
				duration,
				response?.status || 0,
			);
		}

		// Handle specific error codes
		if (response) {
			switch (response.status) {
				case 401:
					break;
				case 403:
					break;
				case 404:
					break;
				case 500:
					break;
				default:
					break;
			}
		} else {
		}

		return Promise.reject(error);
	},
);

// API service functions
export const apiService = {
	// Repository analysis
	analyzeRepository: (path: string, options: AnalysisOptions): Promise<AxiosResponse<{ analysisId: string }>> => {
		return api.post("/analyze", { path, options });
	},

	// Batch analysis
	analyzeBatch: (paths: string[], options: AnalysisOptions): Promise<AxiosResponse<{ batchId: string }>> => {
		return api.post("/analyze/batch", { paths, options });
	},

	// Get repositories
	getRepositories: (): Promise<AxiosResponse<RepositoryAnalysis[]>> => {
		return api.get("/repositories");
	},

	// Search repositories
	searchRepositories: (query: string, filters: SearchQuery): Promise<AxiosResponse<{ repositories: RepositoryAnalysis[]; total: number }>> => {
		return api.get("/repositories/search", { params: { query, ...filters } });
	},

	// Get analysis results
	getAnalysis: (id: string): Promise<AxiosResponse<RepositoryAnalysis>> => {
		return api.get(`/analysis/${id}`);
	},

	// Export analysis
	exportAnalysis: (
		analysis: RepositoryAnalysis,
		format: OutputFormat,
		download = false,
	): Promise<AxiosResponse<Blob | { exportId: string; downloadUrl: string }>> => {
		return api.post(
			"/export",
			{ analysis, format },
			{
				responseType: download ? "blob" : "json",
				params: { download: download.toString() },
			},
		);
	},

	// Export batch analysis
	exportBatchAnalysis: (
		batchAnalysis: BatchAnalysisResult,
		format: OutputFormat,
		download = false,
	): Promise<AxiosResponse<Blob | { exportId: string; downloadUrl: string }>> => {
		return api.post(
			"/export/batch",
			{ batchAnalysis, format },
			{
				responseType: download ? "blob" : "json",
				params: { download: download.toString() },
			},
		);
	},

	// Download export file
	downloadExport: (exportId: string): Promise<AxiosResponse<Blob>> => {
		return api.get(`/export/download/${exportId}`, { responseType: "blob" });
	},

	// Get export history
	getExportHistory: (): Promise<AxiosResponse<{ exports: Array<{ id: string; format: OutputFormat; createdAt: string; size: number }> }>> => {
		return api.get("/export/history");
	},

	// Delete export
	deleteExport: (exportId: string): Promise<AxiosResponse<{ success: boolean }>> => {
		return api.delete(`/export/${exportId}`);
	},

	// Cancel analysis
	cancelAnalysis: (id: string): Promise<AxiosResponse<{ success: boolean }>> => {
		return api.post(`/analysis/${id}/cancel`);
	},
};

// Enhanced error handling with retry and recovery
export const handleApiError = (error: unknown): string => {
	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError;

		if (axiosError.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			const data = axiosError.response.data as { message?: string; error?: string };
			
			// Ensure we return a proper string, not an empty object
			const errorMessage = data?.message || data?.error;
			if (typeof errorMessage === 'string' && errorMessage.trim()) {
				return errorMessage;
			}
			
			return `Error ${axiosError.response.status}: ${axiosError.response.statusText}`;
		}
		if (axiosError.request) {
			// The request was made but no response was received
			return "No response received from server. Please check your connection.";
		}
		// Something happened in setting up the request that triggered an Error
		return `Error: ${axiosError.message}`;
	}

	// For non-axios errors
	if (error instanceof Error) {
		return error.message;
	}
	
	// Fallback for unknown error types
	if (typeof error === 'string') {
		return error;
	}
	
	return "An unknown error occurred";
};

// Enhanced API service with error handling and retry logic
export const createApiService = (onError?: (error: unknown) => void) => {
	const handleError = (error: unknown) => {
		if (onError) {
			onError(error);
		}
		throw error;
	};

	return {
		// Repository analysis with error handling
		analyzeRepository: async (path: string, options: AnalysisOptions): Promise<AxiosResponse<{ analysisId: string }>> => {
			try {
				return await api.post("/analyze", { path, options });
			} catch (error) {
				return handleError(error);
			}
		},

		// Batch analysis with error handling
		analyzeBatch: async (paths: string[], options: AnalysisOptions): Promise<AxiosResponse<{ batchId: string }>> => {
			try {
				return await api.post("/analyze/batch", { paths, options });
			} catch (error) {
				return handleError(error);
			}
		},

		// Get repositories with error handling
		getRepositories: async (): Promise<AxiosResponse<RepositoryAnalysis[]>> => {
			try {
				return await api.get("/repositories");
			} catch (error) {
				return handleError(error);
			}
		},

		// Search repositories with error handling
		searchRepositories: async (
			query: string,
			filters: SearchQuery,
		): Promise<AxiosResponse<{ repositories: RepositoryAnalysis[]; total: number }>> => {
			try {
				return await api.get("/repositories/search", {
					params: { query, ...filters },
				});
			} catch (error) {
				return handleError(error);
			}
		},

		// Get analysis results with error handling
		getAnalysis: async (id: string): Promise<AxiosResponse<RepositoryAnalysis>> => {
			try {
				return await api.get(`/analysis/${id}`);
			} catch (error) {
				return handleError(error);
			}
		},

		// Export analysis with error handling
		exportAnalysis: async (
			analysis: RepositoryAnalysis,
			format: OutputFormat,
			download = false,
		): Promise<AxiosResponse<Blob | { exportId: string; downloadUrl: string }>> => {
			try {
				return await api.post(
					"/export",
					{ analysis, format },
					{
						responseType: download ? "blob" : "json",
						params: { download: download.toString() },
					},
				);
			} catch (error) {
				return handleError(error);
			}
		},

		// Export batch analysis with error handling
		exportBatchAnalysis: async (
			batchAnalysis: BatchAnalysisResult,
			format: OutputFormat,
			download = false,
		): Promise<AxiosResponse<Blob | { exportId: string; downloadUrl: string }>> => {
			try {
				return await api.post(
					"/export/batch",
					{ batchAnalysis, format },
					{
						responseType: download ? "blob" : "json",
						params: { download: download.toString() },
					},
				);
			} catch (error) {
				return handleError(error);
			}
		},

		// Download export file with error handling
		downloadExport: async (exportId: string): Promise<AxiosResponse<Blob>> => {
			try {
				return await api.get(`/export/download/${exportId}`, {
					responseType: "blob",
				});
			} catch (error) {
				return handleError(error);
			}
		},

		// Get export history with error handling
		getExportHistory: async (): Promise<AxiosResponse<{ exports: Array<{ id: string; format: OutputFormat; createdAt: string; size: number }> }>> => {
			try {
				return await api.get("/export/history");
			} catch (error) {
				return handleError(error);
			}
		},

		// Delete export with error handling
		deleteExport: async (exportId: string): Promise<AxiosResponse<{ success: boolean }>> => {
			try {
				return await api.delete(`/export/${exportId}`);
			} catch (error) {
				return handleError(error);
			}
		},

		// Cancel analysis with error handling
		cancelAnalysis: async (id: string): Promise<AxiosResponse<{ success: boolean }>> => {
			try {
				return await api.post(`/analysis/${id}/cancel`);
			} catch (error) {
				return handleError(error);
			}
		},
	};
};

export default api;
