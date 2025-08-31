/**
 * Filesystem controller
 */

import type { Request, Response } from "express";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import logger from "../../services/logger.service";
import { pathHandler } from "../../services/path-handler.service";

// Promisify fs functions
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export interface DirectoryItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  lastModified?: string;
}

export interface BrowseDirectoryResponse {
  path: string;
  items: DirectoryItem[];
  parent?: string;
}

/**
 * Browse a directory and list its contents
 *
 * @param req - Express request
 * @param res - Express response
 */
export const browseDirectory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || `req-${Date.now()}`;

  try {
    const { path: directoryPath } = req.query;

    // Validate path parameter
    if (!directoryPath || typeof directoryPath !== "string") {
      logger.warn("Browse directory request missing path parameter", {
        requestId,
      });
      res.status(400).json({
        error: "Path parameter is required",
        message: "The path parameter is missing or invalid",
        suggestions: ["Provide a valid directory path as a query parameter"],
      });
      return;
    }

    logger.info("Browsing directory", {
      requestId,
      path: directoryPath,
    });

    // Validate and normalize the path using PathHandler
    const pathValidationResult = await pathHandler.validatePath(directoryPath, {
      timeoutMs: 5000, // 5 seconds timeout
      onProgress: (progress) => {
        logger.debug("Path validation progress", {
          requestId,
          stage: progress.stage,
          percentage: progress.percentage,
          message: progress.message,
        });
      },
    });

    // Check if path validation failed
    if (!pathValidationResult.isValid) {
      logger.warn("Directory path validation failed", {
        requestId,
        path: directoryPath,
        errors: pathValidationResult.errors,
        warnings: pathValidationResult.warnings,
      });

      res.status(400).json({
        error: "Invalid path",
        message: "The provided path is invalid",
        path: directoryPath,
        errors: pathValidationResult.errors,
        warnings: pathValidationResult.warnings,
      });
      return;
    }

    // Check if path exists and is accessible
    if (!pathValidationResult.metadata.exists) {
      logger.warn("Directory path does not exist", {
        requestId,
        path: directoryPath,
        normalizedPath: pathValidationResult.normalizedPath,
      });

      res.status(404).json({
        error: "Path not found",
        message: "The specified path does not exist",
        path: directoryPath,
        normalizedPath: pathValidationResult.normalizedPath,
      });
      return;
    }

    // Check if path is a directory
    if (!pathValidationResult.metadata.isDirectory) {
      logger.warn("Path is not a directory", {
        requestId,
        path: directoryPath,
        normalizedPath: pathValidationResult.normalizedPath,
      });

      res.status(400).json({
        error: "Not a directory",
        message: "The specified path is not a directory",
        path: directoryPath,
        normalizedPath: pathValidationResult.normalizedPath,
      });
      return;
    }

    // Check read permissions
    if (!pathValidationResult.metadata.permissions.read) {
      logger.warn("Insufficient read permissions for directory", {
        requestId,
        path: directoryPath,
        normalizedPath: pathValidationResult.normalizedPath,
        permissions: pathValidationResult.metadata.permissions,
      });

      res.status(403).json({
        error: "Permission denied",
        message: "Insufficient read permissions for the specified directory",
        path: directoryPath,
        normalizedPath: pathValidationResult.normalizedPath,
      });
      return;
    }

    // Use the normalized path for browsing
    const normalizedPath = pathValidationResult.normalizedPath;
    if (!normalizedPath) {
      logger.error(
        `Path validation succeeded but normalized path is null. RequestId: ${requestId}, OriginalPath: ${directoryPath}`
      );

      res.status(500).json({
        error: "Internal Server Error",
        message: "Path validation succeeded but normalized path is unavailable",
        suggestions: [
          "Try again with a different path",
          "Check system permissions",
          "Contact support if the issue persists",
        ],
      });
      return;
    }

    logger.info("Path validation successful for browsing", {
      requestId,
      originalPath: directoryPath,
      normalizedPath,
      metadata: pathValidationResult.metadata,
      warnings: pathValidationResult.warnings,
    });

    // Read directory contents
    const entries = await readdir(normalizedPath, { withFileTypes: true });

    // Convert to DirectoryItem format
    const items: DirectoryItem[] = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(normalizedPath, entry.name);
        const entryStat = await stat(entryPath);

        return {
          name: entry.name,
          path: entryPath,
          isDirectory: entry.isDirectory(),
          size: entryStat.size,
          lastModified: entryStat.mtime.toISOString(),
        };
      })
    );

    // Sort items: directories first, then files, both alphabetically
    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    // Get parent directory
    const parent = path.dirname(normalizedPath);
    const hasParent = parent !== normalizedPath; // Check if we're at root

    const response: BrowseDirectoryResponse = {
      path: normalizedPath,
      items,
      parent: hasParent ? parent : undefined,
    };

    logger.info("Directory browsing completed successfully", {
      requestId,
      path: normalizedPath,
      itemCount: items.length,
    });

    res.status(200).json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error(
      `Directory browsing failed: ${errorMessage}. RequestId: ${requestId}, Path: ${req.query.path}, Stack: ${error instanceof Error ? error.stack : undefined}`
    );

    // Handle specific error types
    if (error instanceof Error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        res.status(404).json({
          error: "Directory not found",
          message: "The specified directory does not exist",
          path: req.query.path,
        });
        return;
      }

      if ((error as NodeJS.ErrnoException).code === "EACCES") {
        res.status(403).json({
          error: "Permission denied",
          message: "Access to the specified directory is denied",
          path: req.query.path,
        });
        return;
      }

      if ((error as NodeJS.ErrnoException).code === "ENOTDIR") {
        res.status(400).json({
          error: "Not a directory",
          message: "The specified path is not a directory",
          path: req.query.path,
        });
        return;
      }
    }

    res.status(500).json({
      error: "Failed to browse directory",
      message: errorMessage,
      path: req.query.path,
      suggestions: [
        "Check if the directory path is valid",
        "Ensure the directory is accessible",
        "Verify you have read permissions",
      ],
    });
  }
};

/**
 * Get the user's home directory
 *
 * @param _req - Express request
 * @param res - Express response
 */
export const getHomeDirectory = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const homeDir = os.homedir();

    // Validate home directory exists
    try {
      const stats = await stat(homeDir);
      if (!stats.isDirectory()) {
        throw new Error("Home directory path is not a directory");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Home directory validation failed: ${errorMessage}`);

      res.status(500).json({
        error: "Home directory not accessible",
        message: "The system home directory is not accessible",
        suggestions: ["Check system configuration", "Verify user permissions"],
      });
      return;
    }

    res.status(200).json({
      path: homeDir,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to get home directory: ${errorMessage}`);

    res.status(500).json({
      error: "Failed to get home directory",
      message: errorMessage,
      suggestions: ["Check system configuration"],
    });
  }
};

/**
 * Validate if a path exists and is a directory
 *
 * @param req - Express request
 * @param res - Express response
 */
export const validateDirectory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const requestId =
    (req.headers["x-request-id"] as string) || `req-${Date.now()}`;

  try {
    const { path: directoryPath } = req.query;

    // Validate path parameter
    if (!directoryPath || typeof directoryPath !== "string") {
      res.status(400).json({
        valid: false,
        message: "Path parameter is required",
      });
      return;
    }

    logger.debug("Validating directory path", {
      requestId,
      path: directoryPath,
    });

    // Validate and normalize the path using PathHandler
    const pathValidationResult = await pathHandler.validatePath(directoryPath, {
      timeoutMs: 5000, // 5 seconds timeout
    });

    // Check if path is valid, exists, is a directory, and readable
    const isValid =
      pathValidationResult.isValid &&
      pathValidationResult.metadata.exists &&
      pathValidationResult.metadata.isDirectory &&
      pathValidationResult.metadata.permissions.read;

    res.status(200).json({
      valid: isValid,
      message: isValid ? "Valid directory" : "Invalid directory path",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      `Directory validation failed: ${errorMessage}. RequestId: ${requestId}`
    );

    res.status(200).json({
      valid: false,
      message: "Failed to validate directory",
    });
  }
};

/**
 * Get recent repositories from history
 *
 * @param _req - Express request
 * @param res - Express response
 */
export const getRecentRepositories = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // For now, return an empty array
    // In a real implementation, this would retrieve from a database or file
    res.status(200).json({
      repositories: [],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to get recent repositories: ${errorMessage}`);

    res.status(200).json({
      repositories: [],
    });
  }
};
