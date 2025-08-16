/**
 * Type declarations for PathHandler service
 */

export interface PathValidationResult {
  isValid: boolean;
  normalizedPath?: string;
  errors: PathError[];
  warnings: PathWarning[];
  metadata: {
    exists: boolean;
    isDirectory: boolean;
    permissions: PermissionFlags;
    size?: number;
  };
}

export interface PermissionResult {
  canRead: boolean;
  canWrite: boolean;
  canExecute: boolean;
  owner: string;
  group: string;
  errors: PermissionError[];
}

export interface PathError {
  code: string;
  message: string;
  details?: string;
  suggestions?: string[];
}

export interface PathWarning {
  code: string;
  message: string;
  details?: string;
}

export interface PermissionError {
  code: string;
  message: string;
  details?: string;
}

export interface PermissionFlags {
  read: boolean;
  write: boolean;
  execute: boolean;
}

export declare class PathHandler {
  private static instance;
  private readonly isWindows;
  private readonly pathSeparator;
  private readonly windowsReservedNames;
  private readonly windowsMaxPathLength;
  private readonly windowsMaxComponentLength;

  constructor(platformOverride?: string);

  static getInstance(): PathHandler;
  normalizePath(inputPath: string): string;
  resolveRelativePath(inputPath: string, basePath?: string): string;
  validatePath(inputPath: string): Promise<PathValidationResult>;
  checkPermissions(pathToCheck: string): Promise<PermissionResult>;

  private validatePathFormat(inputPath: string): {
    isValid: boolean;
    errors: PathError[];
    warnings: PathWarning[];
  };
  private checkPathExists(
    pathToCheck: string
  ): Promise<{ exists: boolean; isDirectory: boolean; size?: number }>;
  private isUNCPath(inputPath: string): boolean;
  private normalizeUNCPath(inputPath: string): string;
  private hasDriveLetter(inputPath: string): boolean;
  private isValidDriveLetter(inputPath: string): boolean;
  private normalizeDriveLetter(inputPath: string): string;
}

export declare const pathHandler: PathHandler;
export default pathHandler;
