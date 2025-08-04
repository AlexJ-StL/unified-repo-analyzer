/**
 * Validation utility functions
 */

import { ZodError, type z } from 'zod';
import * as schemas from './schemas';

/**
 * Validates data against a schema and returns the validated data or throws an error
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validated and typed data
 * @throws ZodError if validation fails
 */
export function validate<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  return schema.parse(data);
}

/**
 * Validates data against a schema and returns a result object
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Object with success flag, validated data, and any errors
 */
export function validateSafe<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: boolean; data?: z.infer<T>; errors?: z.ZodError } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
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
export function validateRepositoryAnalysis(data: unknown) {
  return validate(schemas.repositoryAnalysisSchema, data);
}

/**
 * Validates file info data
 * @param data File info data to validate
 * @returns Validated file info data
 */
export function validateFileInfo(data: unknown) {
  return validate(schemas.fileInfoSchema, data);
}

/**
 * Validates analysis options data
 * @param data Analysis options data to validate
 * @returns Validated analysis options data
 */
export function validateAnalysisOptions(data: unknown) {
  return validate(schemas.analysisOptionsSchema, data);
}

/**
 * Validates repository index data
 * @param data Repository index data to validate
 * @returns Validated repository index data
 */
export function validateRepositoryIndex(data: unknown) {
  return validate(schemas.repositoryIndexSchema, data);
}

/**
 * Validates search query data
 * @param data Search query data to validate
 * @returns Validated search query data
 */
export function validateSearchQuery(data: unknown) {
  return validate(schemas.searchQuerySchema, data);
}

/**
 * Validates LLM provider config data
 * @param data LLM provider config data to validate
 * @returns Validated LLM provider config data
 */
export function validateProviderConfig(data: unknown) {
  return validate(schemas.providerConfigSchema, data);
}
