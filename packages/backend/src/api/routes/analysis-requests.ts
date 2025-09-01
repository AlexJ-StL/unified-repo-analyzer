/**
 * Analysis requests API routes
 */

import { Router } from "express";
import { analysisRequestTracker } from "../../services/analysis-request-tracker.service";

const router = Router();

/**
 * GET /api/analysis-requests
 *
 * Get all analysis requests with optional filtering
 */
router.get("/", (req, res) => {
  try {
    const { status, clientId, limit } = req.query;
    const filter: any = {};

    if (status && typeof status === "string") {
      filter.status = status;
    }

    if (clientId && typeof clientId === "string") {
      filter.clientId = clientId;
    }

    if (limit && typeof limit === "string") {
      filter.limit = Number.parseInt(limit, 10);
    }

    const requests = analysisRequestTracker.getRequests(filter);
    res.json(requests);
  } catch (error) {
    console.error("Error fetching analysis requests:", error);
    res.status(500).json({
      error: "Failed to fetch analysis requests",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/analysis-requests/:id
 *
 * Get a specific analysis request by ID
 */
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const request = analysisRequestTracker.getRequest(id);

    if (!request) {
      res.status(404).json({ error: "Analysis request not found" });
      return;
    }

    res.json(request);
  } catch (error) {
    console.error("Error fetching analysis request:", error);
    res.status(500).json({
      error: "Failed to fetch analysis request",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/analysis-requests/stats
 *
 * Get analysis request statistics
 */
router.get("/stats", (req, res) => {
  try {
    const stats = analysisRequestTracker.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching analysis request stats:", error);
    res.status(500).json({
      error: "Failed to fetch analysis request statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
