"use strict";
/**
 * Validation utility functions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
exports.validateSafe = validateSafe;
exports.validateRepositoryAnalysis = validateRepositoryAnalysis;
exports.validateFileInfo = validateFileInfo;
exports.validateAnalysisOptions = validateAnalysisOptions;
exports.validateRepositoryIndex = validateRepositoryIndex;
exports.validateSearchQuery = validateSearchQuery;
exports.validateProviderConfig = validateProviderConfig;
const zod_1 = require("zod");
const schemas = __importStar(require("./schemas"));
/**
 * Validates data against a schema and returns the validated data or throws an error
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validated and typed data
 * @throws ZodError if validation fails
 */
function validate(schema, data) {
    return schema.parse(data);
}
/**
 * Validates data against a schema and returns a result object
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Object with success flag, validated data, and any errors
 */
function validateSafe(schema, data) {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return { success: false, errors: error };
        }
        throw error;
    }
}
/**
 * Validates repository analysis data
 * @param data Repository analysis data to validate
 * @returns Validated repository analysis data
 */
function validateRepositoryAnalysis(data) {
    return validate(schemas.repositoryAnalysisSchema, data);
}
/**
 * Validates file info data
 * @param data File info data to validate
 * @returns Validated file info data
 */
function validateFileInfo(data) {
    return validate(schemas.fileInfoSchema, data);
}
/**
 * Validates analysis options data
 * @param data Analysis options data to validate
 * @returns Validated analysis options data
 */
function validateAnalysisOptions(data) {
    return validate(schemas.analysisOptionsSchema, data);
}
/**
 * Validates repository index data
 * @param data Repository index data to validate
 * @returns Validated repository index data
 */
function validateRepositoryIndex(data) {
    return validate(schemas.repositoryIndexSchema, data);
}
/**
 * Validates search query data
 * @param data Search query data to validate
 * @returns Validated search query data
 */
function validateSearchQuery(data) {
    return validate(schemas.searchQuerySchema, data);
}
/**
 * Validates LLM provider config data
 * @param data LLM provider config data to validate
 * @returns Validated LLM provider config data
 */
function validateProviderConfig(data) {
    return validate(schemas.providerConfigSchema, data);
}
//# sourceMappingURL=validators.js.map