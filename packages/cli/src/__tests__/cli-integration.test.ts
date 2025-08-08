import { beforeEach, describe, expect, test, vi } from "vitest";
import { program } from "../index";
import { config } from "../utils";

// Mock the API client
mock.module("../utils/api-client", () => ({
	ApiClient: mock(() => ({
		analyzeRepository: mock(() => Promise.resolve({})),
	})),
}));

// Mock the progress tracker
mock.module("../utils/progress", () => ({
	ProgressTracker: mock(() => ({
		start: mock(() => {}),
		succeed: mock(() => {}),
		fail: mock(() => {}),
		update: mock(() => {}),
	})),
}));

// Mock fs functions
vi.mock("fs", () => ({
	...vi.importActual("fs"),
	existsSync: vi.fn().mockReturnValue(true),
	writeFileSync: vi.fn(),
	readdirSync: vi.fn().mockReturnValue([
		{ name: "repo1", isDirectory: () => true },
		{ name: "repo2", isDirectory: () => true },
		{ name: "node_modules", isDirectory: () => true },
		{ name: ".git", isDirectory: () => true },
		{ name: "file.txt", isDirectory: () => false },
	]),
}));

// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
console.log = jest.fn();

// Reset mocks before each test
beforeEach(() => {
	jest.clearAllMocks();
	MockApiClient.mockClear();
});

// Restore console.log after all tests
afterAll(() => {
	console.log = originalConsoleLog;
});

describe("CLI Integration Tests", () => {
	describe("analyze command", () => {
		test("should call analyzeRepository with correct parameters", async () => {
			// Mock API response
			const mockAnalyzeRepository = jest.fn().mockResolvedValue({
				id: "test-id",
				name: "test-repo",
				language: "TypeScript",
				fileCount: 100,
				directoryCount: 10,
				totalSize: 1024 * 1024,
				metadata: { processingTime: 1000 },
			});

			MockApiClient.prototype.analyzeRepository = mockAnalyzeRepository;

			// Execute command
			await program.parseAsync([
				"node",
				"test",
				"analyze",
				"./test-repo",
				"--output",
				"json",
				"--mode",
				"quick",
			]);

			// Verify API client was called with correct parameters
			expect(mockAnalyzeRepository).toHaveBeenCalledWith(
				expect.stringContaining("test-repo"),
				expect.objectContaining({
					mode: "quick",
					outputFormats: ["json"],
				}),
			);
		});
	});

	describe("batch command", () => {
		test("should call analyzeBatch with correct parameters", async () => {
			// Mock API response
			const mockAnalyzeBatch = jest.fn().mockResolvedValue({
				id: "batch-id",
				repositories: [
					{ id: "repo1-id", name: "repo1", path: "/path/to/repo1" },
					{ id: "repo2-id", name: "repo2", path: "/path/to/repo2" },
				],
				status: {
					total: 2,
					completed: 2,
					failed: 0,
					inProgress: 0,
					pending: 0,
					progress: 100,
				},
				processingTime: 2000,
			});

			MockApiClient.prototype.analyzeBatch = mockAnalyzeBatch;

			// Execute command
			await program.parseAsync([
				"node",
				"test",
				"batch",
				"./repos",
				"--output",
				"markdown",
				"--depth",
				"2",
				"--combined",
			]);

			// Verify API client was called with correct parameters
			expect(mockAnalyzeBatch).toHaveBeenCalledWith(
				expect.any(Array),
				expect.objectContaining({
					outputFormats: ["markdown"],
				}),
			);
		});
	});

	describe("search command", () => {
		test("should call searchRepositories with correct parameters", async () => {
			// Mock API response
			const mockSearchRepositories = jest.fn().mockResolvedValue([
				{
					repository: {
						id: "repo1-id",
						name: "repo1",
						path: "/path/to/repo1",
						languages: ["TypeScript"],
						frameworks: ["React"],
						tags: ["frontend"],
						summary: "A test repository",
						lastAnalyzed: new Date(),
						size: 1024 * 1024,
						complexity: 0.5,
					},
					score: 0.95,
					matches: [
						{ field: "name", value: "repo1", score: 1.0 },
						{ field: "summary", value: "test repository", score: 0.9 },
					],
				},
			]);

			MockApiClient.prototype.searchRepositories = mockSearchRepositories;

			// Execute command
			await program.parseAsync([
				"node",
				"test",
				"search",
				"test",
				"--language",
				"typescript",
				"--limit",
				"10",
			]);

			// Verify API client was called with correct parameters
			expect(mockSearchRepositories).toHaveBeenCalledWith(
				expect.stringContaining("q=test"),
			);
		});
	});

	describe("export command", () => {
		test("should call exportAnalysis with correct parameters", async () => {
			// Mock API response
			const mockExportAnalysis = jest
				.fn()
				.mockResolvedValue(Buffer.from("test data"));

			MockApiClient.prototype.exportAnalysis = mockExportAnalysis;

			// Execute command
			await program.parseAsync([
				"node",
				"test",
				"export",
				"analysis-123",
				"--format",
				"html",
			]);

			// Verify API client was called with correct parameters
			expect(mockExportAnalysis).toHaveBeenCalledWith("analysis-123", "html");
		});
	});

	describe("index command", () => {
		test("should call rebuildIndex when --rebuild flag is used", async () => {
			// Mock API response
			const mockRebuildIndex = jest.fn().mockResolvedValue(undefined);

			MockApiClient.prototype.rebuildIndex = mockRebuildIndex;

			// Execute command
			await program.parseAsync(["node", "test", "index", "--rebuild"]);

			// Verify API client was called
			expect(mockRebuildIndex).toHaveBeenCalled();
		});

		test("should call updateIndex when --update flag is used", async () => {
			// Mock API response
			const mockUpdateIndex = jest.fn().mockResolvedValue(undefined);

			MockApiClient.prototype.updateIndex = mockUpdateIndex;

			// Execute command
			await program.parseAsync([
				"node",
				"test",
				"index",
				"--update",
				"--path",
				"./repos",
			]);

			// Verify API client was called with correct parameters
			expect(mockUpdateIndex).toHaveBeenCalledWith("./repos");
		});

		test("should call getIndexStatus when no flags are provided", async () => {
			// Mock API response
			const mockGetIndexStatus = jest.fn().mockResolvedValue({
				totalRepositories: 10,
				lastUpdated: new Date().toISOString(),
				languages: ["TypeScript", "JavaScript"],
				frameworks: ["React", "Express"],
				tags: ["frontend", "backend"],
			});

			MockApiClient.prototype.getIndexStatus = mockGetIndexStatus;

			// Execute command
			await program.parseAsync(["node", "test", "index"]);

			// Verify API client was called
			expect(mockGetIndexStatus).toHaveBeenCalled();
		});
	});

	describe("config command", () => {
		test("should update configuration when --set flag is used", async () => {
			// Spy on config.set
			const configSetSpy = jest.spyOn(config, "set");

			// Execute command
			await program.parseAsync([
				"node",
				"test",
				"config",
				"--set",
				"apiUrl=http://localhost:4000/api",
			]);

			// Verify config.set was called with correct parameters
			expect(configSetSpy).toHaveBeenCalledWith(
				"apiUrl",
				"http://localhost:4000/api",
			);
		});

		test("should create a new profile when --create-profile flag is used", async () => {
			// Mock config.get and config.set
			const _configGetSpy = jest
				.spyOn(config, "get")
				.mockImplementation((key) => {
					if (key === "profiles") return {};
					if (key === "apiUrl") return "http://localhost:3000/api";
					if (key === "defaultOptions") return { mode: "standard" };
					if (key === "outputDir") return "./output";
					return undefined;
				});

			const configSetSpy = jest.spyOn(config, "set");

			// Execute command
			await program.parseAsync([
				"node",
				"test",
				"config",
				"--create-profile",
				"dev",
			]);

			// Verify config.set was called with correct parameters
			expect(configSetSpy).toHaveBeenCalledWith("profiles", {
				dev: {
					apiUrl: "http://localhost:3000/api",
					defaultOptions: { mode: "standard" },
					outputDir: "./output",
				},
			});
			expect(configSetSpy).toHaveBeenCalledWith("activeProfile", "dev");
		});
	});
});
