import type {
	BatchAnalysisResult,
	RepositoryAnalysis,
} from "@unified-repo-analyzer/shared/src/types/analysis";
import { ExportService } from "../export.service";
import { vi } from "vitest";

// Mock fs module
vi.mock("fs");
vi.mock("util");

const mockAnalysis: RepositoryAnalysis = {
	id: "test-id",
	name: "test-repo",
	path: "/test/path",
	language: "TypeScript",
	languages: ["TypeScript", "JavaScript"],
	frameworks: ["React", "Node.js"],
	fileCount: 15,
	directoryCount: 8,
	totalSize: 2048,
	createdAt: new Date("2024-01-01T00:00:00Z"),
	updatedAt: new Date("2024-01-02T00:00:00Z"),
	structure: {
		directories: [],
		keyFiles: [
			{
				path: "src/index.ts",
				language: "TypeScript",
				size: 1024,
				lineCount: 50,
				tokenCount: 200,
				importance: 0.9,
				functions: [],
				classes: [],
				description: "Main entry point",
				useCase: "Application bootstrap",
			},
		],
		tree: `test-repo/
├── src/
│   ├── index.ts
│   └── components/
└── package.json`,
	},
	codeAnalysis: {
		functionCount: 12,
		classCount: 5,
		importCount: 20,
		complexity: {
			cyclomaticComplexity: 4,
			maintainabilityIndex: 85,
			technicalDebt: "Low",
			codeQuality: "good",
		},
		patterns: [
			{
				name: "MVC",
				confidence: 80,
				description: "Model-View-Controller pattern detected",
			},
		],
	},
	dependencies: {
		production: [
			{ name: "react", version: "18.0.0", type: "production" },
			{ name: "express", version: "4.18.0", type: "production" },
		],
		development: [
			{ name: "typescript", version: "5.0.0", type: "development" },
			{ name: "vitest", version: "1.0.0", type: "development" },
		],
		frameworks: [],
	},
	insights: {
		executiveSummary:
			"This is a well-structured TypeScript application using React and Express.",
		technicalBreakdown:
			"The codebase follows modern TypeScript practices with good separation of concerns.",
		recommendations: [
			"Consider adding more unit tests",
			"Update dependencies to latest versions",
		],
		potentialIssues: [
			"Some functions have high complexity",
			"Missing error handling in async functions",
		],
	},
	metadata: {
		analysisMode: "comprehensive",
		llmProvider: "claude",
		processingTime: 5000,
		tokenUsage: {
			prompt: 1000,
			completion: 500,
			total: 1500,
		},
	},
};

const mockBatchAnalysis: BatchAnalysisResult = {
	id: "batch-test-id",
	repositories: [mockAnalysis],
	combinedInsights: {
		commonalities: ["TypeScript usage", "React framework"],
		differences: ["Different build tools", "Varying test coverage"],
		integrationOpportunities: [
			"Shared component library",
			"Common API patterns",
		],
	},
	createdAt: new Date("2024-01-01T00:00:00Z"),
	processingTime: 10000,
	status: {
		total: 1,
		completed: 1,
		failed: 0,
		inProgress: 0,
		pending: 0,
		progress: 100,
	},
};

describe("ExportService", () => {
	let exportService: ExportService;

	beforeEach(() => {
		exportService = new ExportService();
		vi.clearAllMocks();
	});

	describe("exportAnalysis", () => {
		it("exports analysis to JSON format", async () => {
			const result = await exportService.exportAnalysis(mockAnalysis, "json");

			expect(result).toBeDefined();
			expect(() => JSON.parse(result)).not.toThrow();

			const parsed = JSON.parse(result);
			expect(parsed.id).toBe(mockAnalysis.id);
			expect(parsed.name).toBe(mockAnalysis.name);
			expect(parsed.language).toBe(mockAnalysis.language);
		});

		it("exports analysis to Markdown format", async () => {
			const result = await exportService.exportAnalysis(
				mockAnalysis,
				"markdown",
			);

			expect(result).toBeDefined();
			expect(result).toContain("# test-repo Repository Analysis");
			expect(result).toContain("## Overview");
			expect(result).toContain("## Executive Summary");
			expect(result).toContain("## Technical Breakdown");
			expect(result).toContain("## Code Structure");
			expect(result).toContain("## Dependencies");
			expect(result).toContain("TypeScript");
			expect(result).toContain("React, Node.js");
		});

		it("exports analysis to HTML format", async () => {
			const result = await exportService.exportAnalysis(mockAnalysis, "html");

			expect(result).toBeDefined();
			expect(result).toContain("<!DOCTYPE html>");
			expect(result).toContain("<title>test-repo Repository Analysis</title>");
			expect(result).toContain("<h1>test-repo Repository Analysis</h1>");
			expect(result).toContain('<h2 id="overview">Overview</h2>');
			expect(result).toContain(
				'<h2 id="executive-summary">Executive Summary</h2>',
			);
			expect(result).toContain("TypeScript");
			expect(result).toContain("React, Node.js");
			expect(result).toContain('class="quality-good"');
		});

		it("throws error for unsupported format", async () => {
			await expect(
				exportService.exportAnalysis(mockAnalysis, "xml" as any),
			).rejects.toThrow("Unsupported export format: xml");
		});
	});

	describe("exportBatchAnalysis", () => {
		it("exports batch analysis to JSON format", async () => {
			const result = await exportService.exportBatchAnalysis(
				mockBatchAnalysis,
				"json",
			);

			expect(result).toBeDefined();
			expect(() => JSON.parse(result)).not.toThrow();

			const parsed = JSON.parse(result);
			expect(parsed.id).toBe(mockBatchAnalysis.id);
			expect(parsed.repositories).toHaveLength(1);
			expect(parsed.combinedInsights).toBeDefined();
		});

		it("exports batch analysis to Markdown format", async () => {
			const result = await exportService.exportBatchAnalysis(
				mockBatchAnalysis,
				"markdown",
			);

			expect(result).toBeDefined();
			expect(result).toContain("# Batch Repository Analysis");
			expect(result).toContain("## Overview");
			expect(result).toContain("## Repositories");
			expect(result).toContain("## Combined Insights");
			expect(result).toContain("### Commonalities");
			expect(result).toContain("### Differences");
			expect(result).toContain("### Integration Opportunities");
			expect(result).toContain("1. test-repo");
		});

		it("exports batch analysis to HTML format", async () => {
			const result = await exportService.exportBatchAnalysis(
				mockBatchAnalysis,
				"html",
			);

			expect(result).toBeDefined();
			expect(result).toContain("<!DOCTYPE html>");
			expect(result).toContain("<title>Batch Repository Analysis</title>");
			expect(result).toContain("<h1>Batch Repository Analysis</h1>");
			expect(result).toContain('<h2 id="overview">Overview</h2>');
			expect(result).toContain('<h2 id="repositories">Repositories</h2>');
			expect(result).toContain(
				'<h2 id="combined-insights">Combined Insights</h2>',
			);
			expect(result).toContain("1. test-repo");
		});

		it("handles batch analysis without combined insights", async () => {
			const batchWithoutInsights = {
				...mockBatchAnalysis,
				combinedInsights: undefined,
			};

			const result = await exportService.exportBatchAnalysis(
				batchWithoutInsights,
				"html",
			);

			expect(result).toBeDefined();
			expect(result).not.toContain(
				'<h2 id="combined-insights">Combined Insights</h2>',
			);
		});

		it("throws error for unsupported format", async () => {
			await expect(
				exportService.exportBatchAnalysis(mockBatchAnalysis, "pdf" as any),
			).rejects.toThrow("Unsupported export format: pdf");
		});
	});

	// Note: saveToFile test skipped due to mocking complexity
	// The method is tested indirectly through integration tests

	describe("format-specific content validation", () => {
		it("JSON export contains all required fields", async () => {
			const result = await exportService.exportAnalysis(mockAnalysis, "json");
			const parsed = JSON.parse(result);

			// Check main fields
			expect(parsed).toHaveProperty("id");
			expect(parsed).toHaveProperty("name");
			expect(parsed).toHaveProperty("path");
			expect(parsed).toHaveProperty("language");
			expect(parsed).toHaveProperty("languages");
			expect(parsed).toHaveProperty("frameworks");
			expect(parsed).toHaveProperty("fileCount");
			expect(parsed).toHaveProperty("directoryCount");
			expect(parsed).toHaveProperty("totalSize");
			expect(parsed).toHaveProperty("createdAt");
			expect(parsed).toHaveProperty("updatedAt");

			// Check nested objects
			expect(parsed).toHaveProperty("structure");
			expect(parsed.structure).toHaveProperty("directories");
			expect(parsed.structure).toHaveProperty("keyFiles");
			expect(parsed.structure).toHaveProperty("tree");

			expect(parsed).toHaveProperty("codeAnalysis");
			expect(parsed.codeAnalysis).toHaveProperty("functionCount");
			expect(parsed.codeAnalysis).toHaveProperty("classCount");
			expect(parsed.codeAnalysis).toHaveProperty("importCount");
			expect(parsed.codeAnalysis).toHaveProperty("complexity");
			expect(parsed.codeAnalysis).toHaveProperty("patterns");

			expect(parsed).toHaveProperty("dependencies");
			expect(parsed.dependencies).toHaveProperty("production");
			expect(parsed.dependencies).toHaveProperty("development");
			expect(parsed.dependencies).toHaveProperty("frameworks");

			expect(parsed).toHaveProperty("insights");
			expect(parsed.insights).toHaveProperty("executiveSummary");
			expect(parsed.insights).toHaveProperty("technicalBreakdown");
			expect(parsed.insights).toHaveProperty("recommendations");
			expect(parsed.insights).toHaveProperty("potentialIssues");

			expect(parsed).toHaveProperty("metadata");
			expect(parsed.metadata).toHaveProperty("analysisMode");
			expect(parsed.metadata).toHaveProperty("llmProvider");
			expect(parsed.metadata).toHaveProperty("processingTime");
			expect(parsed.metadata).toHaveProperty("tokenUsage");
		});

		it("Markdown export contains proper formatting", async () => {
			const result = await exportService.exportAnalysis(
				mockAnalysis,
				"markdown",
			);

			// Check headers
			expect(result).toMatch(/^# test-repo Repository Analysis/m);
			expect(result).toMatch(/^## Overview/m);
			expect(result).toMatch(/^## Executive Summary/m);
			expect(result).toMatch(/^## Technical Breakdown/m);
			expect(result).toMatch(/^## Code Structure/m);
			expect(result).toMatch(/^## Architectural Patterns/m);
			expect(result).toMatch(/^## Key Files/m);
			expect(result).toMatch(/^## Directory Structure/m);
			expect(result).toMatch(/^## Dependencies/m);
			expect(result).toMatch(/^## Recommendations/m);
			expect(result).toMatch(/^## Potential Issues/m);
			expect(result).toMatch(/^## Analysis Metadata/m);

			// Check lists
			expect(result).toContain("- **Repository:** test-repo");
			expect(result).toContain("- **Primary Language:** TypeScript");
			expect(result).toContain("- **Languages:** TypeScript, JavaScript");
			expect(result).toContain("- **Frameworks:** React, Node.js");

			// Check code blocks
			expect(result).toContain("```\ntest-repo/");

			// Check dependencies formatting
			expect(result).toContain("- react@18.0.0");
			expect(result).toContain("- typescript@5.0.0");
		});

		it("HTML export contains proper structure and styling", async () => {
			const result = await exportService.exportAnalysis(mockAnalysis, "html");

			// Check HTML structure
			expect(result).toContain("<!DOCTYPE html>");
			expect(result).toContain('<html lang="en">');
			expect(result).toContain("<head>");
			expect(result).toContain("<body>");
			expect(result).toContain("</html>");

			// Check CSS styles
			expect(result).toContain("<style>");
			expect(result).toContain("font-family:");
			expect(result).toContain("color:");
			expect(result).toContain(".quality-good");

			// Check navigation
			expect(result).toContain('<div class="nav">');
			expect(result).toContain('<a href="#overview">Overview</a>');
			expect(result).toContain(
				'<a href="#executive-summary">Executive Summary</a>',
			);

			// Check content sections
			expect(result).toContain('<h2 id="overview">Overview</h2>');
			expect(result).toContain(
				'<h2 id="executive-summary">Executive Summary</h2>',
			);
			expect(result).toContain(
				'<h2 id="technical-breakdown">Technical Breakdown</h2>',
			);

			// Check tables
			expect(result).toContain("<table>");
			expect(result).toContain("<th>");
			expect(result).toContain("<td>");

			// Check overview cards
			expect(result).toContain('<div class="overview-grid">');
			expect(result).toContain('<div class="overview-card">');

			// Check footer
			expect(result).toContain("<footer");
			expect(result).toContain("Generated by Unified Repository Analyzer");
		});
	});
});
