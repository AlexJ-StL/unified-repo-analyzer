"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEffectiveAnalysisOptions = getEffectiveAnalysisOptions;
exports.updateUserPreferences = updateUserPreferences;
exports.getUserPreferences = getUserPreferences;
exports.resetPreferences = resetPreferences;
const shared_1 = require("@unified-repo-analyzer/shared");
const conf_1 = __importDefault(require("conf"));
// Create config instance with defaults
const config = new conf_1.default({
    projectName: "unified-repo-analyzer",
    defaults: {
        apiUrl: "http://localhost:3000/api",
        defaultOptions: {
            mode: "standard",
            maxFiles: 500,
            maxLinesPerFile: 1000,
            includeLLMAnalysis: true,
            llmProvider: "claude",
            outputFormats: ["json"],
            includeTree: true,
        },
        outputDir: "./analysis-results",
        userPreferences: shared_1.DEFAULT_USER_PREFERENCES,
    },
});
/**
 * Get effective analysis options from user preferences
 */
function getEffectiveAnalysisOptions() {
    const preferences = config.get("userPreferences");
    const defaultOptions = config.get("defaultOptions");
    return {
        mode: preferences.analysis.defaultMode,
        maxFiles: preferences.analysis.maxFiles,
        maxLinesPerFile: preferences.analysis.maxLinesPerFile,
        includeLLMAnalysis: preferences.analysis.includeLLMAnalysis,
        llmProvider: preferences.llmProvider.defaultProvider,
        outputFormats: [preferences.export.defaultFormat],
        includeTree: preferences.analysis.includeTree,
        ...defaultOptions,
    };
}
/**
 * Update user preferences
 */
function updateUserPreferences(preferences) {
    const current = config.get("userPreferences");
    config.set("userPreferences", { ...current, ...preferences });
}
/**
 * Get user preferences
 */
function getUserPreferences() {
    return config.get("userPreferences");
}
/**
 * Reset preferences to defaults
 */
function resetPreferences() {
    config.set("userPreferences", shared_1.DEFAULT_USER_PREFERENCES);
}
exports.default = config;
//# sourceMappingURL=config.js.map