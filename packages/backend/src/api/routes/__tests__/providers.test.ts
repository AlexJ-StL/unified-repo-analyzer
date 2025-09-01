/**
 * Tests for providers API routes
 */

import { beforeEach, describe, expect, test, vi } from "vitest";
import { ProviderRegistry } from "../../../providers/ProviderRegistry";

describe("providers routes", () => {
  beforeEach(() => {
    // Reset the registry before each test
    ProviderRegistry.getInstance().reset();
  });

  describe("GET /api/providers", () => {
    test("should return all registered providers with their status", async () => {
      // Set up some provider configurations
      const registry = ProviderRegistry.getInstance();
      registry.setProviderConfig("claude", { apiKey: "test-claude-key" });
      registry.setProviderConfig("openrouter", {
        apiKey: "test-openrouter-key",
        model: "openrouter/test-model",
      });

      // Import the route handler
      const providersRoute = (await import("../providers")).default;

      // Create a mock request and response
      const req: any = {};
      const res: any = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      // Find the GET handler for the root path
      const routeStack = (providersRoute as any).stack;
      const getHandler = routeStack.find(
        (layer: any) =>
          layer.route && layer.route.path === "/" && layer.route.methods.get
      );

      if (getHandler) {
        // Call the route handler
        await getHandler.route.stack[0].handle(req, res);
      }

      // Verify the response
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];

      expect(response).toHaveProperty("providers");
      expect(response).toHaveProperty("defaultProvider");
      expect(response.providers).toHaveLength(4); // claude, gemini, openrouter, mock

      // Check that configured providers are marked as configured
      const claudeProvider = response.providers.find(
        (p: any) => p.id === "claude"
      );
      const openrouterProvider = response.providers.find(
        (p: any) => p.id === "openrouter"
      );
      const mockProvider = response.providers.find((p: any) => p.id === "mock");

      expect(claudeProvider).toBeDefined();
      expect(claudeProvider.configured).toBe(true);
      expect(claudeProvider.model).toBe("claude-3-haiku-20240307");

      expect(openrouterProvider).toBeDefined();
      expect(openrouterProvider.configured).toBe(true);
      expect(openrouterProvider.model).toBe("openrouter/test-model");

      expect(mockProvider).toBeDefined();
      expect(mockProvider.configured).toBe(false);
    });

    test("should handle errors gracefully", async () => {
      // Import the route handler
      const providersRoute = (await import("../providers")).default;

      // Create a mock request and response
      const req: any = {};
      const res: any = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      // Mock an error in the registry
      vi.spyOn(
        ProviderRegistry.getInstance(),
        "getAllProviderInfo"
      ).mockImplementation(() => {
        throw new Error("Test error");
      });

      // Find the GET handler for the root path
      const routeStack = (providersRoute as any).stack;
      const getHandler = routeStack.find(
        (layer: any) =>
          layer.route && layer.route.path === "/" && layer.route.methods.get
      );

      if (getHandler) {
        // Call the route handler
        await getHandler.route.stack[0].handle(req, res);
      }

      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
      const errorResponse = res.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty("error");
      expect(errorResponse).toHaveProperty("message");
    });
  });

  describe("POST /api/providers/:name/test", () => {
    test("should test a provider and return results", async () => {
      // Set up provider configuration
      const registry = ProviderRegistry.getInstance();
      registry.setProviderConfig("openrouter", { apiKey: "test-key" });

      // Import the route handler
      const providersRoute = (await import("../providers")).default;

      // Create a mock request and response
      const req: any = {
        params: { name: "openrouter" },
      };
      const res: any = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      // Find the POST handler for the test path
      const routeStack = (providersRoute as any).stack;
      const postHandler = routeStack.find(
        (layer: any) =>
          layer.route &&
          layer.route.path === "/:name/test" &&
          layer.route.methods.post
      );

      if (postHandler) {
        // Call the route handler
        await postHandler.route.stack[0].handle(req, res);
      }

      // Verify the response
      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];

      expect(response).toHaveProperty("provider", "openrouter");
      expect(response).toHaveProperty("working", true);
      expect(response).toHaveProperty("status", "active");
    });

    test("should return 404 for non-existent provider", async () => {
      // Import the route handler
      const providersRoute = (await import("../providers")).default;

      // Create a mock request and response
      const req: any = {
        params: { name: "nonexistent" },
      };
      const res: any = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      };

      // Find the POST handler for the test path
      const routeStack = (providersRoute as any).stack;
      const postHandler = routeStack.find(
        (layer: any) =>
          layer.route &&
          layer.route.path === "/:name/test" &&
          layer.route.methods.post
      );

      if (postHandler) {
        // Call the route handler
        await postHandler.route.stack[0].handle(req, res);
      }

      // Verify error response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
      const errorResponse = res.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty("error");
      expect(errorResponse).toHaveProperty("message");
    });
  });
});
