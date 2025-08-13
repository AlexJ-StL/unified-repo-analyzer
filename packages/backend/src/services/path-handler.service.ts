import fs from "node:fs/promises";
import { platform } from "node:os";
import path from "node:path";
import logger from "./logger.service.js";

/**
 * Path validation result interface
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

/**
 * Permission checking result interface
 */
export interface PermissionResult {
	canRead: boolean;
	canWrite: boolean;
	canExecute: boolean;
	owner: string;
	group: string;
	errors: PermissionError[];
}

/**
 * Path error types
 */
export interface PathError {
	code: string;
	message: string;
	details?: string;
	suggestions?: string[];
}

/**
 * Path warning types
 */
export interface PathWarning {
	code: string;
	message: string;
	details?: string;
}

/**
 * Permission error types
 */
export interface PermissionError {
	code: string;
	message: string;
	details?: string;
}

/**
 * Permission flags interface
 */
export interface PermissionFlags {
	read: boolean;
	write: boolean;
	execute: boolean;
}

/**
 * Progress callback function type
 */
export type ProgressCallback = (progress: {
	stage: string;
	percentage: number;
	message: string;
}) => void;

/**
 * Timeout options for path operations
 */
export interface TimeoutOptions {
	timeoutMs?: number;
	onProgress?: ProgressCallback;
	signal?: AbortSignal;
}

/**
 * PathHandler service for cross-platform path processing and validation
 */
export class PathHandler {
	private static instance: PathHandler;
	private readonly isWindows: boolean;
	private readonly pathSeparator: string;

	// Windows reserved names
	private readonly windowsReservedNames = new Set([
		"CON",
		"PRN",
		"AUX",
		"NUL",
		"COM1",
		"COM2",
		"COM3",
		"COM4",
		"COM5",
		"COM6",
		"COM7",
		"COM8",
		"COM9",
		"LPT1",
		"LPT2",
		"LPT3",
		"LPT4",
		"LPT5",
		"LPT6",
		"LPT7",
		"LPT8",
		"LPT9",
	]);

	// Windows path length limits
	private readonly windowsMaxPathLength = 260;
	private readonly windowsMaxComponentLength = 255;

	// Default timeout settings
	private readonly defaultTimeoutMs = 5000; // 5 seconds
	private readonly progressUpdateIntervalMs = 100; // 100ms

	constructor(platformOverride?: string) {
		this.isWindows = (platformOverride || platform()) === "win32";
		this.pathSeparator = this.isWindows ? "\\" : "/";
	}

	/**
	 * Get singleton instance
	 */
	public static getInstance(): PathHandler {
		if (!PathHandler.instance) {
			PathHandler.instance = new PathHandler();
		}
		return PathHandler.instance;
	}

	/**
	 * Normalize path for cross-platform compatibility
	 */
	public normalizePath(inputPath: string): string {
		if (!inputPath || typeof inputPath !== "string") {
			throw new Error("Path must be a non-empty string");
		}

		try {
			// Handle UNC paths on Windows
			if (this.isWindows && this.isUNCPath(inputPath)) {
				return this.normalizeUNCPath(inputPath);
			}

			let normalizedPath: string;

			if (this.isWindows) {
				// Convert forward slashes to backslashes on Windows
				normalizedPath = inputPath.replace(/\//g, "\\");
				// Use Node.js path.normalize for basic normalization
				normalizedPath = path.normalize(normalizedPath);
			} else {
				// Convert backslashes to forward slashes on Unix-like systems
				normalizedPath = inputPath.replace(/\\/g, "/");
				// Use path.posix.normalize for Unix-like systems to avoid Windows path conversion
				normalizedPath = path.posix.normalize(normalizedPath);
			}

			// Handle Windows drive letters
			if (this.isWindows && this.hasDriveLetter(normalizedPath)) {
				normalizedPath = this.normalizeDriveLetter(normalizedPath);
			}

			logger.debug("Path normalized", {
				original: inputPath,
				normalized: normalizedPath,
				platform: platform(),
			});

			return normalizedPath;
		} catch (error) {
			logger.error("Path normalization failed", {
				path: inputPath,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Resolve relative path to absolute path
	 */
	public resolveRelativePath(inputPath: string, basePath?: string): string {
		if (!inputPath || typeof inputPath !== "string") {
			throw new Error("Path must be a non-empty string");
		}

		try {
			const resolvedPath = basePath
				? path.resolve(basePath, inputPath)
				: path.resolve(inputPath);

			return this.normalizePath(resolvedPath);
		} catch (error) {
			logger.error("Path resolution failed", {
				path: inputPath,
				basePath,
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	}

	/**
	 * Validate path format and accessibility with timeout and progress support
	 */
	public async validatePath(
		inputPath: string,
		options?: TimeoutOptions,
	): Promise<PathValidationResult> {
		const timeoutMs = options?.timeoutMs || this.defaultTimeoutMs;
		const onProgress = options?.onProgress;
		const signal = options?.signal;

		return this.withTimeout(
			this.validatePathInternal(inputPath, onProgress, signal),
			timeoutMs,
			`Path validation timed out after ${timeoutMs}ms`,
			signal,
		);
	}

	/**
	 * Internal path validation implementation
	 */
	private async validatePathInternal(
		inputPath: string,
		onProgress?: ProgressCallback,
		signal?: AbortSignal,
	): Promise<PathValidationResult> {
		const result: PathValidationResult = {
			isValid: false,
			errors: [],
			warnings: [],
			metadata: {
				exists: false,
				isDirectory: false,
				permissions: { read: false, write: false, execute: false },
			},
		};

		try {
			// Check for cancellation
			this.checkCancellation(signal);

			// Stage 1: Format validation (20%)
			onProgress?.({
				stage: "format_validation",
				percentage: 10,
				message: "Validating path format...",
			});

			const formatValidation = this.validatePathFormat(inputPath);
			result.errors.push(...formatValidation.errors);
			result.warnings.push(...formatValidation.warnings);

			onProgress?.({
				stage: "format_validation",
				percentage: 20,
				message: "Path format validation completed",
			});

			if (!formatValidation.isValid) {
				return result;
			}

			this.checkCancellation(signal);

			// Stage 2: Path normalization (40%)
			onProgress?.({
				stage: "normalization",
				percentage: 30,
				message: "Normalizing path...",
			});

			const normalizedPath = this.normalizePath(inputPath);
			result.normalizedPath = normalizedPath;

			onProgress?.({
				stage: "normalization",
				percentage: 40,
				message: "Path normalization completed",
			});

			this.checkCancellation(signal);

			// Stage 3: Path existence check (60%)
			onProgress?.({
				stage: "existence_check",
				percentage: 50,
				message: "Checking path existence...",
			});

			const existsResult = await this.checkPathExists(normalizedPath);
			result.metadata.exists = existsResult.exists;
			result.metadata.isDirectory = existsResult.isDirectory;
			result.metadata.size = existsResult.size;

			onProgress?.({
				stage: "existence_check",
				percentage: 60,
				message: "Path existence check completed",
			});

			this.checkCancellation(signal);

			// Stage 4: Permission check (80%)
			if (existsResult.exists) {
				onProgress?.({
					stage: "permission_check",
					percentage: 70,
					message: "Checking permissions...",
				});

				const permissionResult = await this.checkPermissions(normalizedPath);
				result.metadata.permissions = {
					read: permissionResult.canRead,
					write: permissionResult.canWrite,
					execute: permissionResult.canExecute,
				};
				result.errors.push(...permissionResult.errors);

				onProgress?.({
					stage: "permission_check",
					percentage: 80,
					message: "Permission check completed",
				});
			}

			this.checkCancellation(signal);

			// Stage 5: Finalization (100%)
			onProgress?.({
				stage: "finalization",
				percentage: 90,
				message: "Finalizing validation...",
			});

			// Path is valid if no errors occurred
			result.isValid = result.errors.length === 0;

			onProgress?.({
				stage: "completed",
				percentage: 100,
				message: "Path validation completed",
			});

			logger.debug("Path validation completed", {
				path: inputPath,
				normalized: normalizedPath,
				isValid: result.isValid,
				exists: result.metadata.exists,
				errorCount: result.errors.length,
			});

			return result;
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				const cancelledResult = { ...result };
				cancelledResult.errors.push({
					code: "OPERATION_CANCELLED",
					message: "Path validation was cancelled",
					details: "The operation was cancelled by user request",
				});
				return cancelledResult;
			}

			const errorMessage =
				error instanceof Error ? error.message : String(error);
			result.errors.push({
				code: "VALIDATION_ERROR",
				message: "Path validation failed",
				details: errorMessage,
			});

			logger.error("Path validation error", {
				path: inputPath,
				error: errorMessage,
			});

			return result;
		}
	}

	/**
	 * Check permissions for a given path with timeout support
	 */
	public async checkPermissions(
		pathToCheck: string,
		options?: TimeoutOptions,
	): Promise<PermissionResult> {
		const timeoutMs = options?.timeoutMs || this.defaultTimeoutMs;
		const signal = options?.signal;

		return this.withTimeout(
			this.checkPermissionsInternal(pathToCheck, signal),
			timeoutMs,
			`Permission check timed out after ${timeoutMs}ms`,
			signal,
		);
	}

	/**
	 * Internal permission checking implementation
	 */
	private async checkPermissionsInternal(
		pathToCheck: string,
		signal?: AbortSignal,
	): Promise<PermissionResult> {
		const result: PermissionResult = {
			canRead: false,
			canWrite: false,
			canExecute: false,
			owner: "",
			group: "",
			errors: [],
		};

		try {
			// Check for cancellation
			this.checkCancellation(signal);

			// First check if the path exists
			let pathExists = false;
			let stats: any = null;

			try {
				stats = await fs.stat(pathToCheck);
				pathExists = true;
			} catch (error) {
				result.errors.push({
					code: "PATH_NOT_FOUND",
					message: "Path does not exist",
					details: `Cannot check permissions for non-existent path: ${pathToCheck}`,
				});
				return result;
			}

			this.checkCancellation(signal);

			// Check basic permissions using fs.access
			await this.checkBasicPermissions(pathToCheck, result);

			this.checkCancellation(signal);

			// Get detailed file information
			if (pathExists && stats) {
				await this.getFileOwnership(stats, result);

				this.checkCancellation(signal);

				// Windows-specific permission checks
				if (this.isWindows) {
					await this.checkWindowsPermissions(pathToCheck, stats, result);
				}
			}

			logger.debug("Permission check completed", {
				path: pathToCheck,
				canRead: result.canRead,
				canWrite: result.canWrite,
				canExecute: result.canExecute,
				owner: result.owner,
				group: result.group,
				errorCount: result.errors.length,
			});

			return result;
		} catch (error) {
			result.errors.push({
				code: "PERMISSION_CHECK_ERROR",
				message: "Permission check failed",
				details: error instanceof Error ? error.message : String(error),
			});

			logger.error("Permission check error", {
				path: pathToCheck,
				error: error instanceof Error ? error.message : String(error),
			});

			return result;
		}
	}

	/**
	 * Check basic file system permissions using fs.access
	 */
	private async checkBasicPermissions(
		pathToCheck: string,
		result: PermissionResult,
	): Promise<void> {
		// Check read permission
		try {
			await fs.access(pathToCheck, fs.constants.R_OK);
			result.canRead = true;
		} catch (error) {
			result.canRead = false;
			if (this.isWindows) {
				result.errors.push({
					code: "READ_PERMISSION_DENIED",
					message: "Read access denied",
					details: "You do not have permission to read this file or directory",
				});
			}
		}

		// Check write permission
		try {
			await fs.access(pathToCheck, fs.constants.W_OK);
			result.canWrite = true;
		} catch (error) {
			result.canWrite = false;
			if (this.isWindows) {
				result.errors.push({
					code: "WRITE_PERMISSION_DENIED",
					message: "Write access denied",
					details:
						"You do not have permission to modify this file or directory",
				});
			}
		}

		// Check execute permission
		try {
			await fs.access(pathToCheck, fs.constants.X_OK);
			result.canExecute = true;
		} catch (error) {
			result.canExecute = false;
			// Execute permission is less critical, so we don't add it as an error
		}
	}

	/**
	 * Get file ownership information
	 */
	private async getFileOwnership(
		stats: any,
		result: PermissionResult,
	): Promise<void> {
		try {
			if (this.isWindows) {
				// On Windows, try to get owner information if available
				// Note: Node.js fs.stat on Windows may not provide meaningful uid/gid
				result.owner = "Windows User";
				result.group = "Windows Group";
			} else {
				// Unix-like systems
				result.owner = stats.uid?.toString() || "unknown";
				result.group = stats.gid?.toString() || "unknown";
			}
		} catch (error) {
			result.errors.push({
				code: "OWNERSHIP_INFO_ERROR",
				message: "Could not retrieve file ownership information",
				details: error instanceof Error ? error.message : String(error),
			});
		}
	}

	/**
	 * Windows-specific permission checks and ACL mapping
	 */
	private async checkWindowsPermissions(
		pathToCheck: string,
		stats: any,
		result: PermissionResult,
	): Promise<void> {
		try {
			// Check if it's a system file or directory
			if (this.isSystemPath(pathToCheck)) {
				result.errors.push({
					code: "SYSTEM_PATH_ACCESS",
					message: "Attempting to access system path",
					details: "This path may require administrator privileges",
				});
			}

			// Check for read-only attribute
			if (stats.mode && this.isReadOnlyFile(stats.mode)) {
				result.canWrite = false;
				result.errors.push({
					code: "READ_ONLY_FILE",
					message: "File is marked as read-only",
					details: "Remove the read-only attribute to enable write access",
				});
			}

			// Check for hidden or system attributes that might affect access
			if (this.isHiddenOrSystemFile(pathToCheck)) {
				// This is just informational, not necessarily an error
				logger.debug("Accessing hidden or system file", { path: pathToCheck });
			}
		} catch (error) {
			result.errors.push({
				code: "WINDOWS_PERMISSION_CHECK_ERROR",
				message: "Windows-specific permission check failed",
				details: error instanceof Error ? error.message : String(error),
			});
		}
	}

	/**
	 * Check if path is a Windows system path
	 */
	private isSystemPath(pathToCheck: string): boolean {
		if (!this.isWindows) return false;

		const normalizedPath = pathToCheck.toLowerCase();
		const systemPaths = [
			"c:\\windows",
			"c:\\program files",
			"c:\\program files (x86)",
			"c:\\system volume information",
			"c:\\$recycle.bin",
		];

		return systemPaths.some((sysPath) => normalizedPath.startsWith(sysPath));
	}

	/**
	 * Check if file has read-only attribute (Windows)
	 */
	private isReadOnlyFile(mode: number): boolean {
		if (!this.isWindows) return false;

		// On Windows, check if the write bit is not set
		// This is a simplified check as Windows file attributes are more complex
		return (mode & 0o200) === 0;
	}

	/**
	 * Check if file is hidden or system file (Windows)
	 */
	private isHiddenOrSystemFile(pathToCheck: string): boolean {
		if (!this.isWindows) return false;

		const fileName = path.basename(pathToCheck);
		return fileName.startsWith(".") || fileName.startsWith("$");
	}

	/**
	 * Wrap an operation with timeout handling
	 */
	private async withTimeout<T>(
		operation: Promise<T>,
		timeoutMs: number,
		timeoutMessage: string,
		signal?: AbortSignal,
	): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			let timeoutId: NodeJS.Timeout;
			let isResolved = false;

			// Set up timeout
			timeoutId = setTimeout(() => {
				if (!isResolved) {
					isResolved = true;
					const timeoutError = new Error(timeoutMessage);
					timeoutError.name = "TimeoutError";
					reject(timeoutError);
				}
			}, timeoutMs);

			// Handle abort signal
			const onAbort = () => {
				if (!isResolved) {
					isResolved = true;
					clearTimeout(timeoutId);
					const abortError = new Error("Operation was aborted");
					abortError.name = "AbortError";
					reject(abortError);
				}
			};

			if (signal) {
				if (signal.aborted) {
					onAbort();
					return;
				}
				signal.addEventListener("abort", onAbort);
			}

			// Execute the operation
			operation
				.then((result) => {
					if (!isResolved) {
						isResolved = true;
						clearTimeout(timeoutId);
						if (signal) {
							signal.removeEventListener("abort", onAbort);
						}
						resolve(result);
					}
				})
				.catch((error) => {
					if (!isResolved) {
						isResolved = true;
						clearTimeout(timeoutId);
						if (signal) {
							signal.removeEventListener("abort", onAbort);
						}
						reject(error);
					}
				});
		});
	}

	/**
	 * Check if operation should be cancelled
	 */
	private checkCancellation(signal?: AbortSignal): void {
		if (signal?.aborted) {
			const error = new Error("Operation was cancelled");
			error.name = "AbortError";
			throw error;
		}
	}

	/**
	 * Create an AbortController for cancelling operations
	 */
	public createAbortController(): AbortController {
		return new AbortController();
	}

	/**
	 * Validate path format (Windows-specific and cross-platform)
	 */
	private validatePathFormat(inputPath: string): {
		isValid: boolean;
		errors: PathError[];
		warnings: PathWarning[];
	} {
		const errors: PathError[] = [];
		const warnings: PathWarning[] = [];

		// Check for empty or invalid input
		if (!inputPath || typeof inputPath !== "string") {
			errors.push({
				code: "INVALID_INPUT",
				message: "Path must be a non-empty string",
			});
			return { isValid: false, errors, warnings };
		}

		// Check for null bytes (security issue)
		if (inputPath.includes("\0")) {
			errors.push({
				code: "NULL_BYTE_IN_PATH",
				message: "Path contains null bytes",
				details: "Null bytes in paths can be a security vulnerability",
				suggestions: ["Remove null bytes from the path"],
			});
		}

		// Windows-specific validations
		if (this.isWindows) {
			// Check path length
			if (inputPath.length > this.windowsMaxPathLength) {
				errors.push({
					code: "PATH_TOO_LONG",
					message: `Path exceeds Windows maximum length of ${this.windowsMaxPathLength} characters`,
					details: `Current length: ${inputPath.length}`,
					suggestions: [
						"Use shorter directory names",
						"Move files closer to root directory",
						"Enable long path support in Windows",
					],
				});
			}

			// Check for reserved names
			const pathComponents = inputPath.split(/[\\/]/);
			for (const component of pathComponents) {
				if (!component) continue; // Skip empty components

				const baseName = component.split(".")[0].toUpperCase();
				if (this.windowsReservedNames.has(baseName)) {
					errors.push({
						code: "RESERVED_NAME",
						message: `Path contains Windows reserved name: ${component}`,
						details: `Reserved names: ${Array.from(this.windowsReservedNames).join(", ")}`,
						suggestions: [
							"Rename the file or directory to avoid reserved names",
						],
					});
				}

				// Check component length
				if (component.length > this.windowsMaxComponentLength) {
					warnings.push({
						code: "COMPONENT_TOO_LONG",
						message: `Path component "${component}" exceeds recommended length`,
						details: `Component length: ${component.length}, recommended max: ${this.windowsMaxComponentLength}`,
					});
				}

				// Check for trailing spaces or dots (Windows issue)
				if (component.endsWith(" ") || component.endsWith(".")) {
					errors.push({
						code: "INVALID_COMPONENT_ENDING",
						message: `Path component "${component}" ends with space or dot`,
						details:
							"Windows does not allow file/folder names ending with spaces or dots",
						suggestions: [
							"Remove trailing spaces or dots from the component name",
						],
					});
				}
			}

			// Check for invalid characters (excluding valid drive letter colons)
			let pathToCheck = inputPath;

			// If path has a valid drive letter, temporarily remove it for character validation
			if (
				this.hasDriveLetter(inputPath) &&
				this.isValidDriveLetter(inputPath)
			) {
				pathToCheck = inputPath.substring(2); // Remove "C:" part
			}

			const invalidChars = /[<>:"|?*]/;
			if (invalidChars.test(pathToCheck)) {
				const foundChars = pathToCheck.match(/[<>:"|?*]/g);
				errors.push({
					code: "INVALID_CHARACTERS",
					message: "Path contains invalid characters for Windows",
					details: `Invalid characters found: ${foundChars?.join(", ")}. Forbidden: < > : " | ? *`,
					suggestions: [
						"Remove or replace invalid characters with valid alternatives",
					],
				});
			}

			// Check for control characters (ASCII 0-31)
			const controlChars = /[\x00-\x1f]/;
			if (controlChars.test(inputPath)) {
				errors.push({
					code: "CONTROL_CHARACTERS",
					message: "Path contains control characters",
					details:
						"Control characters (ASCII 0-31) are not allowed in Windows paths",
					suggestions: ["Remove control characters from the path"],
				});
			}

			// Validate drive letter format (only check if it looks like it should have a drive letter)
			if (this.hasDriveLetter(inputPath)) {
				if (!this.isValidDriveLetter(inputPath)) {
					errors.push({
						code: "INVALID_DRIVE_LETTER",
						message: "Invalid drive letter format",
						details: "Drive letter must be A-Z followed by a colon",
						suggestions: ["Use format like C:\\ or D:\\"],
					});
				}
			} else if (/^[^A-Za-z]:/.test(inputPath)) {
				// Check for invalid drive letter patterns like "1:\"
				errors.push({
					code: "INVALID_DRIVE_LETTER",
					message: "Invalid drive letter format",
					details: "Drive letter must be A-Z followed by a colon",
					suggestions: ["Use format like C:\\ or D:\\"],
				});
			}

			// Validate UNC path format
			if (this.isUNCPath(inputPath)) {
				if (!this.isValidUNCPath(inputPath)) {
					errors.push({
						code: "INVALID_UNC_PATH",
						message: "Invalid UNC path format",
						details: "UNC paths must follow the format \\\\server\\share\\path",
						suggestions: ["Use proper UNC format: \\\\server\\share\\path"],
					});
				}
			}
		} else {
			// Unix-like system validations
			// Check for invalid characters in Unix (mainly null byte, already checked above)

			// Warn about very long paths even on Unix systems
			if (inputPath.length > 4096) {
				warnings.push({
					code: "VERY_LONG_PATH",
					message: "Path is very long and may cause issues",
					details: `Path length: ${inputPath.length} characters`,
				});
			}
		}

		return { isValid: errors.length === 0, errors, warnings };
	}

	/**
	 * Check if path exists and get basic metadata
	 */
	private async checkPathExists(
		pathToCheck: string,
	): Promise<{ exists: boolean; isDirectory: boolean; size?: number }> {
		try {
			const stats = await fs.stat(pathToCheck);
			return {
				exists: true,
				isDirectory: stats.isDirectory(),
				size: stats.isDirectory() ? undefined : stats.size,
			};
		} catch {
			return {
				exists: false,
				isDirectory: false,
			};
		}
	}

	/**
	 * Check if path is a UNC path (Windows)
	 */
	private isUNCPath(inputPath: string): boolean {
		return this.isWindows && inputPath.startsWith("\\\\");
	}

	/**
	 * Validate UNC path format
	 */
	private isValidUNCPath(inputPath: string): boolean {
		if (!this.isUNCPath(inputPath)) {
			return false;
		}

		// UNC path should have at least \\server\share format
		const uncPattern = /^\\\\[^\\]+\\[^\\]+/;
		return uncPattern.test(inputPath);
	}

	/**
	 * Normalize UNC path
	 */
	private normalizeUNCPath(inputPath: string): string {
		// Ensure UNC path starts with exactly two backslashes
		return inputPath.replace(/^\\+/, "\\\\");
	}

	/**
	 * Check if path has a drive letter
	 */
	private hasDriveLetter(inputPath: string): boolean {
		return this.isWindows && /^[A-Za-z]:/.test(inputPath);
	}

	/**
	 * Validate drive letter format
	 */
	private isValidDriveLetter(inputPath: string): boolean {
		return /^[A-Za-z]:([\\/]|$)/.test(inputPath);
	}

	/**
	 * Normalize drive letter to uppercase
	 */
	private normalizeDriveLetter(inputPath: string): string {
		return inputPath.replace(
			/^([A-Za-z]):/,
			(match, letter) => `${letter.toUpperCase()}:`,
		);
	}
}

// Export singleton instance
export const pathHandler = PathHandler.getInstance();
export default pathHandler;
