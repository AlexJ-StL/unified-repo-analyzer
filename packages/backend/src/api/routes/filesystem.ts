/**
 * Filesystem routes
 */

import { Router } from "express";
import { query } from "express-validator";
import * as filesystemController from "../controllers/filesystem.controller";

const router = Router();

/**
 * GET /api/filesystem/browse
 * Browse a directory and list its contents
 */
router.get(
  "/browse",
  [query("path").isString().notEmpty().withMessage("Path is required")],
  filesystemController.browseDirectory as any
);

/**
 * GET /api/filesystem/home
 * Get the user's home directory
 */
router.get("/home", filesystemController.getHomeDirectory as any);

/**
 * GET /api/filesystem/validate
 * Validate if a path exists and is a directory
 */
router.get(
  "/validate",
  [query("path").isString().notEmpty().withMessage("Path is required")],
  filesystemController.validateDirectory as any
);

/**
 * GET /api/filesystem/recent-repositories
 * Get recent repositories from history
 */
router.get(
  "/recent-repositories",
  filesystemController.getRecentRepositories as any
);

export default router;
