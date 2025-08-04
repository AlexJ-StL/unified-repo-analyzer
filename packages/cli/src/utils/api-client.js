"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const undici_1 = require("undici");
const config_1 = __importDefault(require("./config"));
const error_handler_1 = require("./error-handler");
/**
 * API client for communicating with the backend
 */
class ApiClient {
    baseUrl;
    constructor() {
        this.baseUrl = config_1.default.get("apiUrl");
    }
    /**
     * Analyze a single repository
     */
    async analyzeRepository(path, options = {}) {
        try {
            const response = await (0, undici_1.request)(`${this.baseUrl}/analyze`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    path,
                    options: {
                        ...config_1.default.get("defaultOptions"),
                        ...options,
                    },
                }),
            });
            if (response.statusCode >= 400) {
                const body = (await response.body.json());
                throw new error_handler_1.CLIError(body.message || `API error: ${response.statusCode}`, response.statusCode === 401
                    ? error_handler_1.ErrorType.AUTHENTICATION
                    : error_handler_1.ErrorType.NETWORK);
            }
            return (await response.body.json());
        }
        catch (error) {
            if (error instanceof error_handler_1.CLIError) {
                throw error;
            }
            throw new error_handler_1.CLIError(`Failed to analyze repository: ${error.message}`, error_handler_1.ErrorType.NETWORK);
        }
    }
    /**
     * Analyze multiple repositories
     */
    async analyzeBatch(paths, options = {}) {
        try {
            const response = await (0, undici_1.request)(`${this.baseUrl}/analyze/batch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    paths,
                    options: {
                        ...config_1.default.get("defaultOptions"),
                        ...options,
                    },
                }),
            });
            if (response.statusCode >= 400) {
                const body = (await response.body.json());
                throw new error_handler_1.CLIError(body.message || `API error: ${response.statusCode}`, response.statusCode === 401
                    ? error_handler_1.ErrorType.AUTHENTICATION
                    : error_handler_1.ErrorType.NETWORK);
            }
            return (await response.body.json());
        }
        catch (error) {
            if (error instanceof error_handler_1.CLIError) {
                throw error;
            }
            throw new error_handler_1.CLIError(`Failed to analyze repositories: ${error.message}`, error_handler_1.ErrorType.NETWORK);
        }
    }
    /**
     * Export analysis results
     */
    async exportAnalysis(analysisId, format = "json") {
        try {
            const response = await (0, undici_1.request)(`${this.baseUrl}/export`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    analysisId,
                    format,
                }),
            });
            if (response.statusCode >= 400) {
                const body = (await response.body.json());
                throw new error_handler_1.CLIError(body.message || `API error: ${response.statusCode}`, response.statusCode === 401
                    ? error_handler_1.ErrorType.AUTHENTICATION
                    : error_handler_1.ErrorType.NETWORK);
            }
            return Buffer.from(await response.body.arrayBuffer());
        }
        catch (error) {
            if (error instanceof error_handler_1.CLIError) {
                throw error;
            }
            throw new error_handler_1.CLIError(`Failed to export analysis: ${error.message}`, error_handler_1.ErrorType.NETWORK);
        }
    }
    /**
     * Search repositories
     */
    async searchRepositories(queryString) {
        try {
            const response = await (0, undici_1.request)(`${this.baseUrl}/repositories/search?${queryString}`, {
                method: "GET",
            });
            if (response.statusCode >= 400) {
                const body = (await response.body.json());
                throw new error_handler_1.CLIError(body.message || `API error: ${response.statusCode}`, response.statusCode === 401
                    ? error_handler_1.ErrorType.AUTHENTICATION
                    : error_handler_1.ErrorType.NETWORK);
            }
            return (await response.body.json());
        }
        catch (error) {
            if (error instanceof error_handler_1.CLIError) {
                throw error;
            }
            throw new error_handler_1.CLIError(`Failed to search repositories: ${error.message}`, error_handler_1.ErrorType.NETWORK);
        }
    }
    /**
     * Rebuild the repository index
     */
    async rebuildIndex() {
        try {
            const response = await (0, undici_1.request)(`${this.baseUrl}/index/rebuild`, {
                method: "POST",
            });
            if (response.statusCode >= 400) {
                const body = (await response.body.json());
                throw new error_handler_1.CLIError(body.message || `API error: ${response.statusCode}`, response.statusCode === 401
                    ? error_handler_1.ErrorType.AUTHENTICATION
                    : error_handler_1.ErrorType.NETWORK);
            }
        }
        catch (error) {
            if (error instanceof error_handler_1.CLIError) {
                throw error;
            }
            throw new error_handler_1.CLIError(`Failed to rebuild index: ${error.message}`, error_handler_1.ErrorType.NETWORK);
        }
    }
    /**
     * Update the repository index
     */
    async updateIndex(path) {
        try {
            const response = await (0, undici_1.request)(`${this.baseUrl}/index/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    path,
                }),
            });
            if (response.statusCode >= 400) {
                const body = (await response.body.json());
                throw new error_handler_1.CLIError(body.message || `API error: ${response.statusCode}`, response.statusCode === 401
                    ? error_handler_1.ErrorType.AUTHENTICATION
                    : error_handler_1.ErrorType.NETWORK);
            }
        }
        catch (error) {
            if (error instanceof error_handler_1.CLIError) {
                throw error;
            }
            throw new error_handler_1.CLIError(`Failed to update index: ${error.message}`, error_handler_1.ErrorType.NETWORK);
        }
    }
    /**
     * Get index status
     */
    async getIndexStatus() {
        try {
            const response = await (0, undici_1.request)(`${this.baseUrl}/index/status`, {
                method: "GET",
            });
            if (response.statusCode >= 400) {
                const body = (await response.body.json());
                throw new error_handler_1.CLIError(body.message || `API error: ${response.statusCode}`, response.statusCode === 401
                    ? error_handler_1.ErrorType.AUTHENTICATION
                    : error_handler_1.ErrorType.NETWORK);
            }
            return (await response.body.json());
        }
        catch (error) {
            if (error instanceof error_handler_1.CLIError) {
                throw error;
            }
            throw new error_handler_1.CLIError(`Failed to get index status: ${error.message}`, error_handler_1.ErrorType.NETWORK);
        }
    }
}
exports.ApiClient = ApiClient;
//# sourceMappingURL=api-client.js.map