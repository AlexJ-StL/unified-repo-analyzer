import axios, { type AxiosError } from "axios";
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
		(config as any).metadata = { startTime: performance.now() };

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
		const config = response.config as any;
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
		if (config && (config as any)?.metadata?.startTime) {
			const duration = performance.now() - (config as any).metadata.startTime;
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
					// Handle unauthorized
					console.error("Unauthorized access");
					break;
				case 403:
					// Handle forbidden
					console.error("Forbidden access");
					break;
				case 404:
					// Handle not found
					console.error("Resource not found");
					break;
				case 500:
					// Handle server error
					console.error("Server error");
					break;
				default:
					// Handle other errors
					console.error(`Error: ${response.status}`);
					break;
			}
		} else {
			// Handle network errors
			console.error("Network error - check your connection");
		}

		return Promise.reject(error);
	},
);

// API service functions
export const apiService = {
	// Repository analysis
	analyzeRepository: (path: string, options: any) => {
		return api.post("/analyze", { path, options });
	},

	// Batch analysis
	analyzeBatch: (paths: string[], options: any) => {
		return api.post("/analyze/batch", { paths, options });
	},

	// Get repositories
	getRepositories: () => {
		return api.get("/repositories");
	},

	// Search repositories
	searchRepositories: (query: string, filters: any) => {
		return api.get("/repositories/search", { params: { query, ...filters } });
	},

	// Get analysis results
	getAnalysis: (id: string) => {
		return api.get(`/analysis/${id}`);
	},

	// Export analysis
	exportAnalysis: (analysis: any, format: string, download = false) => {
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
		batchAnalysis: any,
		format: string,
		download = false,
	) => {
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
	downloadExport: (exportId: string) => {
		return api.get(`/export/download/${exportId}`, { responseType: "blob" });
	},

	// Get export history
	getExportHistory: () => {
		return api.get("/export/history");
	},

	// Delete export
	deleteExport: (exportId: string) => {
		return api.delete(`/export/${exportId}`);
	},

	// Cancel analysis
	cancelAnalysis: (id: string) => {
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
			const data = axiosError.response.data as any;
			return (
				data.message ||
				`Error ${axiosError.response.status}: ${axiosError.response.statusText}`
			);
		} else if (axiosError.request) {
			// The request was made but no response was received
			return "No response received from server. Please check your connection.";
		} else {
			// Something happened in setting up the request that triggered an Error
			return `Error: ${axiosError.message}`;
		}
	}

	// For non-axios errors
	return error instanceof Error ? error.message : "An unknown error occurred";
};

// Enhanced API service with error handling and retry logic
export const createApiService = (onError?: (error: any) => void) => {
	const handleError = (error: any) => {
		if (onError) {
			onError(error);
		}
		throw error;
	};

	return {
		// Repository analysis with error handling
		analyzeRepository: async (path: string, options: any) => {
			try {
				return await api.post("/analyze", { path, options });
			} catch (error) {
				return handleError(error);
			}
		},

		// Batch analysis with error handling
		analyzeBatch: async (paths: string[], options: any) => {
			try {
				return await api.post("/analyze/batch", { paths, options });
			} catch (error) {
				return handleError(error);
			}
		},

		// Get repositories with error handling
		getRepositories: async () => {
			try {
				return await api.get("/repositories");
			} catch (error) {
				return handleError(error);
			}
		},

		// Search repositories with error handling
		searchRepositories: async (query: string, filters: any) => {
			try {
				return await api.get("/repositories/search", {
					params: { query, ...filters },
				});
			} catch (error) {
				return handleError(error);
			}
		},

		// Get analysis results with error handling
		getAnalysis: async (id: string) => {
			try {
				return await api.get(`/analysis/${id}`);
			} catch (error) {
				return handleError(error);
			}
		},

		// Export analysis with error handling
		exportAnalysis: async (analysis: any, format: string, download = false) => {
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
			batchAnalysis: any,
			format: string,
			download = false,
		) => {
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
		downloadExport: async (exportId: string) => {
			try {
				return await api.get(`/export/download/${exportId}`, {
					responseType: "blob",
				});
			} catch (error) {
				return handleError(error);
			}
		},

		// Get export history with error handling
		getExportHistory: async () => {
			try {
				return await api.get("/export/history");
			} catch (error) {
				return handleError(error);
			}
		},

		// Delete export with error handling
		deleteExport: async (exportId: string) => {
			try {
				return await api.delete(`/export/${exportId}`);
			} catch (error) {
				return handleError(error);
			}
		},

		// Cancel analysis with error handling
		cancelAnalysis: async (id: string) => {
			try {
				return await api.post(`/analysis/${id}/cancel`);
			} catch (error) {
				return handleError(error);
			}
		},
	};
};

export default api;
