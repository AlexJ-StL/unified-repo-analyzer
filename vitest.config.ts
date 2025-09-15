import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    pool: "threads",
    setupFiles: ["./tests/setup-minimal.ts"],
    define: {
      global: "globalThis",
      "process.env.NODE_ENV": JSON.stringify("test")
    },
    include: ["packages/**/*.test.ts", "packages/**/*.spec.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      enabled: true,
      reporter: ["text", "json", "html"],
      include: ["packages/**/src/**"],
      exclude: ["**/node_modules/**", "**/test/**"]
    }
  },
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "packages/shared/src")
    }
  }
});
