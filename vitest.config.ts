import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./tests/setup.ts"],
		// Use different environments based on file patterns
		environmentMatchGlobs: [
			["**/packages/frontend/**", "jsdom"],
			["**/packages/backend/**", "node"],
			["**/packages/cli/**", "node"],
			["**/packages/shared/**", "node"],
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			exclude: [
				"node_modules/",
				"dist/",
				"coverage/",
				"**/*.d.ts",
				"**/*.config.*",
				"**/tests/**",
				"**/__tests__/**",
				"**/*.test.*",
				"**/*.spec.*",
			],
			thresholds: {
				global: {
					branches: 80,
					functions: 80,
					lines: 80,
					statements: 80,
				},
			},
		},
		testTimeout: 30000,
		hookTimeout: 30000,
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./packages/shared/src"),
			"@backend": resolve(__dirname, "./packages/backend/src"),
			"@frontend": resolve(__dirname, "./packages/frontend/src"),
			"@cli": resolve(__dirname, "./packages/cli/src"),
		},
	},
});
