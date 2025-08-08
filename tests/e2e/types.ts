/**
 * Type definitions for E2E tests
 */

export interface AnalysisResult {
	id: string;
	status: "completed" | "failed" | "pending";
	result: {
		name: string;
		language: string;
		languages: string[];
		frameworks?: string[];
		dependencies: {
			production: Array<{ name: string; version?: string }>;
			development: Array<{ name: string; version?: string }>;
		};
		structure: {
			keyFiles: Array<{ path: string; type?: string }>;
			tree?: unknown;
		};
		fileCount: number;
		totalSize?: number;
		directoryCount?: number;
		metadata: {
			analysisMode: string;
			processingTime?: number;
		};
	};
	error?: string;
}

export interface BatchResult {
	id: string;
	status: "completed" | "failed" | "pending";
	results: Array<{
		status: "completed" | "failed";
		result?: AnalysisResult["result"];
		error?: string;
	}>;
	error?: string;
}

export interface RepoSummary {
	name: string;
	languages: string[];
	frameworks?: string[];
	path?: string;
}

export interface SearchResponse {
	data: RepoSummary[];
	length: number;
}

export interface CLIOutput {
	results: Array<{
		status: "completed" | "failed";
		result?: AnalysisResult["result"];
		error?: string;
	}>;
}

export interface ErrorDetails {
	code?: string;
	statusCode?: number;
	details?: Record<string, unknown>;
	recoverable: boolean;
	userMessage: string;
}

export interface PerformanceStats {
	count: number;
	min: number;
	max: number;
	avg: number;
	median: number;
	p95: number;
}
