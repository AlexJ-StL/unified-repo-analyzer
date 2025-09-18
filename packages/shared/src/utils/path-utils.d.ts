/**
 * Type definitions for Centralized Path Validation Utility
 */

export interface PathValidationResult {
  isValid: boolean;
  normalizedPath?: string;
  errors: PathValidationError[];
  warnings: PathValidationWarning[];
  metadata: {
    exists: boolean;
    isDirectory: boolean;
    isFile: boolean;
    permissions?: {
      readable: boolean;
      writable: boolean;
      executable: boolean;
    };
    size?: number;
  };
}

export interface PathValidationError {
  code: string;
  message: string;
  details?: string;
  suggestions?: string[];
}

export interface PathValidationWarning {
  code: string;
  message: string;
  details?: string;
}

export interface PathValidationOptions {
  checkExistence?: boolean;
  checkPermissions?: boolean;
  securityChecks?: boolean;
  basePath?: string;
  timeoutMs?: number;
  allowUncPaths?: boolean;
  allowSymlinks?: boolean;
  maxPathLength?: number;
}

export enum SecurityLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  STRICT = 'strict',
  PARANOID = 'paranoid'
}

export declare class PathValidator {
  static getInstance(): PathValidator;
  validatePath(inputPath: string, options?: PathValidationOptions): Promise<PathValidationResult>;
  quickValidate(inputPath: string, securityLevel?: SecurityLevel): Promise<PathValidationResult>;
  normalizePath(inputPath: string, basePath?: string): string;
}

export declare const pathValidator: PathValidator;

export declare function validatePath(inputPath: string, options?: PathValidationOptions): Promise<PathValidationResult>;
export declare function quickValidate(inputPath: string, securityLevel?: SecurityLevel): Promise<PathValidationResult>;
export declare function normalizePath(inputPath: string, basePath?: string): string;