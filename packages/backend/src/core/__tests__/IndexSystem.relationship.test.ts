/**
 * Tests for IndexSystem relationship functionality
 */

import type {
  CombinationSuggestion,
  RepositoryAnalysis,
} from "@unified-repo-analyzer/shared/src/types/analysis";
import type { IndexedRepository } from "@unified-repo-analyzer/shared/src/types/repository";
import { beforeEach, describe, expect, it } from "vitest";
import { IndexSystem } from "../IndexSystem";

describe("IndexSystem Relationship Functionality", () => {
  let indexSystem: IndexSystem;

  beforeEach(() => {
    indexSystem = new IndexSystem();
  });

  describe("calculateSimilarity", () => {
    it("should calculate high similarity for repositories with shared languages and frameworks", () => {
      const repoA: IndexedRepository = {
        id: "repo-a",
        name: "frontend-app",
        path: "/path/to/frontend",
        languages: ["javascript", "typescript"],
        frameworks: ["react", "express"],
        tags: ["frontend", "web"],
        summary: "A React frontend application",
        lastAnalyzed: new Date(),
        size: 1000000,
        complexity: 50,
      };

      const repoB: IndexedRepository = {
        id: "repo-b",
        name: "backend-api",
        path: "/path/to/backend",
        languages: ["javascript", "typescript"],
        frameworks: ["express", "node.js"],
        tags: ["backend", "api"],
        summary: "An Express backend API",
        lastAnalyzed: new Date(),
        size: 800000,
        complexity: 45,
      };

      // Access private method through type assertion
      const similarity = (indexSystem as any).calculateSimilarity(repoA, repoB);

      expect(similarity.score).toBeGreaterThan(0.5);
      expect(similarity.type).toBe("complementary");
      expect(similarity.reason).toContain("javascript");
      expect(similarity.reason).toContain("express");
    });

    it("should identify fork relationships for similar names and high similarity", () => {
      const repoA: IndexedRepository = {
        id: "repo-a",
        name: "my-project",
        path: "/path/to/original",
        languages: ["python"],
        frameworks: ["django"],
        tags: ["web", "python"],
        summary: "Original Django project",
        lastAnalyzed: new Date(),
        size: 1500000,
        complexity: 60,
      };

      const repoB: IndexedRepository = {
        id: "repo-b",
        name: "my-project-fork",
        path: "/path/to/fork",
        languages: ["python"],
        frameworks: ["django"],
        tags: ["web", "python", "fork"],
        summary: "Forked Django project with modifications",
        lastAnalyzed: new Date(),
        size: 1600000,
        complexity: 65,
      };

      const similarity = (indexSystem as any).calculateSimilarity(repoA, repoB);

      expect(similarity.score).toBeGreaterThan(0.8);
      expect(similarity.type).toBe("fork");
      expect(similarity.reason).toContain("Similar repository names");
    });

    it("should identify dependency relationships for library-application pairs", () => {
      const libraryRepo: IndexedRepository = {
        id: "lib-repo",
        name: "utility-library",
        path: "/path/to/lib",
        languages: ["javascript"],
        frameworks: ["npm"],
        tags: ["library", "utility"],
        summary: "A utility library for common functions",
        lastAnalyzed: new Date(),
        size: 200000,
        complexity: 80,
      };

      const appRepo: IndexedRepository = {
        id: "app-repo",
        name: "web-application",
        path: "/path/to/app",
        languages: ["javascript"],
        frameworks: ["react", "express"],
        tags: ["application", "web"],
        summary: "A web application using various libraries",
        lastAnalyzed: new Date(),
        size: 2000000,
        complexity: 40,
      };

      const similarity = (indexSystem as any).calculateSimilarity(
        libraryRepo,
        appRepo
      );

      expect(similarity.type).toBe("dependency");
      expect(similarity.reason).toContain("javascript");
    });

    it("should calculate low similarity for unrelated repositories", () => {
      const repoA: IndexedRepository = {
        id: "repo-a",
        name: "python-ml-project",
        path: "/path/to/ml",
        languages: ["python"],
        frameworks: ["tensorflow", "pandas"],
        tags: ["machine-learning", "data-science"],
        summary: "Machine learning project with TensorFlow",
        lastAnalyzed: new Date(),
        size: 5000000,
        complexity: 90,
      };

      const repoB: IndexedRepository = {
        id: "repo-b",
        name: "ios-mobile-app",
        path: "/path/to/ios",
        languages: ["swift"],
        frameworks: ["uikit", "core-data"],
        tags: ["mobile", "ios"],
        summary: "iOS mobile application",
        lastAnalyzed: new Date(),
        size: 1000000,
        complexity: 30,
      };

      const similarity = (indexSystem as any).calculateSimilarity(repoA, repoB);

      expect(similarity.score).toBeLessThan(0.3);
    });
  });

  describe("suggestCombinations", () => {
    beforeEach(async () => {
      // Add test repositories to the index
      const repositories = [
        createMockAnalysis(
          "frontend-1",
          "React Frontend application",
          ["javascript", "typescript"],
          ["react"]
        ),
        createMockAnalysis(
          "backend-1",
          "Express Backend",
          ["javascript", "typescript"],
          ["express"]
        ),
        createMockAnalysis(
          "mobile-1",
          "React Native App",
          ["javascript", "typescript"],
          ["react-native"]
        ),
        createMockAnalysis(
          "library-1",
          "utility-library",
          ["javascript"],
          ["npm"]
        ),
        createMockAnalysis(
          "service-1",
          "Microservice A",
          ["javascript"],
          ["express"]
        ),
        createMockAnalysis(
          "service-2",
          "Microservice B",
          ["javascript"],
          ["express"]
        ),
      ];

      for (const repo of repositories) {
        await indexSystem.addRepository(repo as RepositoryAnalysis);
      }
    });

    it("should suggest full-stack combinations", async () => {
      const repoIds = ["frontend-1", "backend-1"];
      const suggestions = await indexSystem.suggestCombinations(repoIds);

      expect(suggestions.length).toBeGreaterThan(0);

      const fullStackSuggestion = suggestions.find(
        (s: CombinationSuggestion) =>
          s.repositories.includes("frontend-1") &&
          s.repositories.includes("backend-1")
      );

      expect(fullStackSuggestion).toBeDefined();
      expect(fullStackSuggestion?.compatibility).toBeGreaterThan(0.5);
      expect(fullStackSuggestion?.rationale).toContain("Full-stack");
    });

    it("should suggest microservices combinations", async () => {
      const repoIds = ["service-1", "service-2"];
      const suggestions = await indexSystem.suggestCombinations(repoIds);

      expect(suggestions.length).toBeGreaterThan(0);

      const microservicesSuggestion = suggestions.find(
        (s: CombinationSuggestion) =>
          s.repositories.includes("service-1") &&
          s.repositories.includes("service-2")
      );

      expect(microservicesSuggestion).toBeDefined();
      expect(microservicesSuggestion?.rationale).toContain("Microservices");
    });

    it("should suggest library ecosystem combinations", async () => {
      const repoIds = ["library-1", "frontend-1"];
      const suggestions = await indexSystem.suggestCombinations(repoIds);

      expect(suggestions.length).toBeGreaterThan(0);

      const librarySuggestion = suggestions.find(
        (s: CombinationSuggestion) =>
          s.repositories.includes("library-1") &&
          s.repositories.includes("frontend-1")
      );

      expect(librarySuggestion).toBeDefined();
      expect(librarySuggestion?.rationale).toContain("Library");
    });

    it("should sort suggestions by compatibility score", async () => {
      const repoIds = ["frontend-1", "backend-1", "mobile-1", "library-1"];
      const suggestions = await indexSystem.suggestCombinations(repoIds);

      expect(suggestions.length).toBeGreaterThan(1);

      // Check that suggestions are sorted by compatibility (descending)
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i - 1].compatibility).toBeGreaterThanOrEqual(
          suggestions[i].compatibility
        );
      }
    });

    it("should limit suggestions to top 10", async () => {
      // Add more repositories to generate many combinations
      const moreRepos: RepositoryAnalysis[] = [];
      for (let i = 0; i < 10; i++) {
        moreRepos.push(
          createMockAnalysis(
            `repo-${i}`,
            `Repository ${i}`,
            ["javascript"],
            ["express"]
          )
        );
      }

      for (const repo of moreRepos) {
        await indexSystem.addRepository(repo as RepositoryAnalysis);
      }

      const allRepoIds = moreRepos.map((r) => (r as RepositoryAnalysis).id);
      const suggestions = await indexSystem.suggestCombinations(allRepoIds);

      expect(suggestions.length).toBeLessThanOrEqual(10);
    });
  });

  describe("repository type detection", () => {
    it("should correctly identify frontend repositories", () => {
      const frontendRepo: IndexedRepository = {
        id: "frontend",
        name: "my-react-app",
        path: "/path/to/frontend",
        languages: ["javascript", "typescript"],
        frameworks: ["react"],
        tags: ["frontend", "web"],
        summary: "React frontend application",
        lastAnalyzed: new Date(),
        size: 1000000,
        complexity: 40,
      };

      const isFrontend = (indexSystem as any).isFrontendRepo(frontendRepo);
      expect(isFrontend).toBe(true);
    });

    it("should correctly identify backend repositories", () => {
      const backendRepo: IndexedRepository = {
        id: "backend",
        name: "api-server",
        path: "/path/to/backend",
        languages: ["javascript"],
        frameworks: ["express"],
        tags: ["backend", "api"],
        summary: "Express API server",
        lastAnalyzed: new Date(),
        size: 800000,
        complexity: 50,
      };

      const isBackend = (indexSystem as any).isBackendRepo(backendRepo);
      expect(isBackend).toBe(true);
    });

    it("should correctly identify mobile repositories", () => {
      const mobileRepo: IndexedRepository = {
        id: "mobile",
        name: "mobile-app",
        path: "/path/to/mobile",
        languages: ["swift"],
        frameworks: ["uikit"],
        tags: ["mobile", "ios"],
        summary: "iOS mobile application",
        lastAnalyzed: new Date(),
        size: 1200000,
        complexity: 35,
      };

      const isMobile = (indexSystem as any).isMobileRepo(mobileRepo);
      expect(isMobile).toBe(true);
    });

    it("should correctly identify library repositories", () => {
      const libraryRepo: IndexedRepository = {
        id: "library",
        name: "utility-lib",
        path: "/path/to/lib",
        languages: ["javascript"],
        frameworks: ["npm"],
        tags: ["library", "utility"],
        summary: "Utility library for common functions",
        lastAnalyzed: new Date(),
        size: 300000,
        complexity: 70,
      };

      const isLibrary = (indexSystem as any).isLibraryRepo(libraryRepo);
      expect(isLibrary).toBe(true);
    });
  });
});

// Helper function to create mock repository analysis
function createMockAnalysis(
  id: string,
  name: string,
  languages: string[],
  frameworks: string[]
): RepositoryAnalysis {
  return {
    id,
    path: `/path/to/${id}`,
    name,
    description: `Mock repository: ${name}`,
    language: languages[0] || "javascript",
    languages,
    frameworks,
    fileCount: 50,
    directoryCount: 10,
    totalSize: 1000000,
    createdAt: new Date(),
    updatedAt: new Date(),
    structure: {
      directories: [],
      keyFiles: [],
      tree: "",
    },
    codeAnalysis: {
      functionCount: 20,
      classCount: 5,
      importCount: 15,
      complexity: {
        cyclomaticComplexity: 10,
        maintainabilityIndex: 70,
        technicalDebt: "Low",
        codeQuality: "good",
      },
      patterns: [],
    },
    dependencies: {
      production: [],
      development: [],
      frameworks: [],
    },
    insights: {
      executiveSummary: `Executive summary for ${name}`,
      technicalBreakdown: `Technical breakdown for ${name}`,
      recommendations: [],
      potentialIssues: [],
    },
    metadata: {
      analysisMode: "standard",
      processingTime: 1000,
    },
  };
}
