/**
 * Provider discovery API routes
 */

import { Router } from "express";
import { ProviderRegistry } from "../../providers/ProviderRegistry";

const router = Router();

/**
 * GET /api/providers
 *
 * Get all available LLM providers with their status and configuration information
 */
router.get("/", (req, res) => {
  try {
    const registry = ProviderRegistry.getInstance();
    const defaultProvider = registry.getDefaultProviderName();
    const providers = registry.getAllProviderInfo();

    res.json({
      providers,
      defaultProvider,
    });
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({
      error: "Failed to fetch providers",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/providers/:name/test
 *
 * Test a provider's connection and configuration
 */
router.post("/:name/test", async (req, res) => {
  try {
    const registry = ProviderRegistry.getInstance();
    const providerName = req.params.name.toLowerCase();

    // Check if provider exists
    if (!registry.hasProvider(providerName)) {
      res.status(404).json({
        error: "Provider not found",
        message: `Provider '${providerName}' is not registered`,
      });
      return;
    }

    // Test the provider
    const isWorking = await registry.testProvider(providerName);
    const statusInfo = registry.getProviderStatus(providerName);

    res.json({
      provider: providerName,
      working: isWorking,
      status: statusInfo.status,
      lastTested: statusInfo.lastTested,
      errorMessage: statusInfo.errorMessage,
    });
  } catch (error) {
    console.error("Error testing provider:", error);
    res.status(500).json({
      error: "Failed to test provider",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/providers/:name/models
 *
 * Get available models for a provider (currently only supported for OpenRouter)
 */
router.get("/:name/models", async (req, res) => {
  try {
    const registry = ProviderRegistry.getInstance();
    const providerName = req.params.name.toLowerCase();

    // Check if provider exists
    if (!registry.hasProvider(providerName)) {
      res.status(404).json({
        error: "Provider not found",
        message: `Provider '${providerName}' is not registered`,
      });
      return;
    }

    // Get provider config to get API key
    const config = registry.getProviderConfig(providerName);
    if (!config.apiKey) {
      res.status(400).json({
        error: "API key required",
        message: `Provider '${providerName}' requires an API key to fetch models`,
      });
      return;
    }

    // Fetch models
    const models = await registry.fetchProviderModels(
      providerName,
      config.apiKey
    );

    res.json({
      provider: providerName,
      models,
    });
  } catch (error) {
    console.error("Error fetching provider models:", error);
    res.status(500).json({
      error: "Failed to fetch provider models",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
