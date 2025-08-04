import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vitest/config";
export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        css: true,
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
            "@unified-repo-analyzer/shared": resolve(__dirname, "../shared/src"),
        },
    },
});
//# sourceMappingURL=vitest.config.js.map