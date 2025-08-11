// Browser-compatible exports from shared package
// Only exports types, interfaces, and validation schemas - no Node.js specific code

// Export all shared types and interfaces
export * from "./types/analysis";
export * from "./types/config";
export * from "./types/provider";
export * from "./types/repository";

// Export validation module (Zod schemas are browser-compatible)
export * from "./validation";

// Note: build-utils and error-handling are excluded as they contain Node.js specific code
