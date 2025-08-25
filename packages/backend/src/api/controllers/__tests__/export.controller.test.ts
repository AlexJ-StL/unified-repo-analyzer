import fs from "node:fs";
import type { Request, Response } from "express";
import { vi } from "vitest";
import exportService from "../../../services/export.service";
import {
  deleteExport,
  downloadExport,
  exportAnalysis,
  exportBatchAnalysis,
  getExportHistory
} from "../export.controller";

// Mock the export service
vi.mock("../../../services/export.service", () => ({
  default: {
    exportAnalysis: vi.fn(),
    exportBatchAnalysis: vi.fn(),
    saveToFile: vi.fn()
  }
}));

// Mock fs
vi.mock("fs", () => ({
  default: {
    createReadStream: vi.fn(),
    stat: vi.fn(),
    mkdir: vi.fn(),
    readdir: vi.fn(),
    unlink: vi.fn()
  }
}));

// Mock express-validator
vi.mock("express-validator", () => ({
  validationResult: jest.fn(() => ({
    isEmpty: () => true,
    array: () => []
  }))
}));

// Mock uuid
vi.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid")
}));

const mockAnalysis = {
  id: "test-id",
  name: "test-repo",
  path: "/test/path",
  language: "TypeScript",
  languages: ["TypeScript"],
  frameworks: ["React"],
  fileCount: 10,
  directoryCount: 5,
  totalSize: 1024,
  createdAt: new Date(),
  updatedAt: new Date(),
  structure: { directories: [], keyFiles: [], tree: "test" },
  codeAnalysis: {
    functionCount: 5,
    classCount: 2,
    importCount: 10,
    complexity: {
      cyclomaticComplexity: 3,
      maintainabilityIndex: 80,
      technicalDebt: "Low",
      codeQuality: "good" as const
    },
    patterns: []
  },
  dependencies: { production: [], development: [], frameworks: [] },
  insights: {
    executiveSummary: "Test summary",
    technicalBreakdown: "Test breakdown",
    recommendations: [],
    potentialIssues: []
  },
  metadata: {
    analysisMode: "standard" as const,
    processingTime: 1000
  }
};

const mockBatchAnalysis = {
  id: "batch-id",
  repositories: [mockAnalysis],
  createdAt: new Date(),
  processingTime: 2000
};

describe("Export Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let _mockNext: any;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {}
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
      sendStatus: vi.fn().mockReturnThis(),
      links: vi.fn().mockReturnThis(),
      append: vi.fn().mockReturnThis(),
      attachment: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
      download: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      format: vi.fn().mockReturnThis(),
      get: vi.fn().mockReturnThis(),
      jsonp: vi.fn().mockReturnThis(),
      location: vi.fn().mockReturnThis(),
      redirect: vi.fn().mockReturnThis(),
      render: vi.fn().mockReturnThis(),
      sendFile: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      type: vi.fn().mockReturnThis(),
      vary: vi.fn().mockReturnThis()
    } as unknown as Response;

    _mockNext = vi.fn();
    vi.clearAllMocks();
  });

  describe("exportAnalysis", () => {
    it("exports analysis for direct download", async () => {
      mockRequest.body = {
        analysis: mockAnalysis,
        format: "json"
      };
      mockRequest.query = { download: "true" };

      const mockContent = JSON.stringify(mockAnalysis);
      (exportService.exportAnalysis as any).mockResolvedValue(mockContent);

      await exportAnalysis(mockRequest as Request, mockResponse as Response);

      expect(exportService.exportAnalysis).toHaveBeenCalledWith(
        mockAnalysis,
        "json"
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/json"
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        'attachment; filename="test_repo_analysis.json"'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockContent);
    });

    it("exports analysis and saves to file", async () => {
      mockRequest.body = {
        analysis: mockAnalysis,
        format: "markdown"
      };

      const mockContent = "# Test Analysis";
      (exportService.exportAnalysis as any).mockResolvedValue(mockContent);
      (exportService.saveToFile as any).mockResolvedValue("/path/to/file");

      await exportAnalysis(mockRequest as Request, mockResponse as Response);

      expect(exportService.exportAnalysis).toHaveBeenCalledWith(
        mockAnalysis,
        "markdown"
      );
      expect(exportService.saveToFile).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        exportId: "test-uuid",
        format: "markdown",
        filename: "test-uuid.md",
        downloadUrl: "/api/export/download/test-uuid",
        size: expect.any(Number)
      });
    });

    it("returns 404 when analysis not provided", async () => {
      mockRequest.body = {
        format: "json"
      };

      await exportAnalysis(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Analysis not found"
      });
    });

    it("handles export service errors", async () => {
      mockRequest.body = {
        analysis: mockAnalysis,
        format: "json"
      };

      const mockError = new Error("Export failed");
      (exportService.exportAnalysis as any).mockRejectedValue(mockError);

      await exportAnalysis(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Failed to export analysis",
        message: "Export failed"
      });
    });
  });

  describe("exportBatchAnalysis", () => {
    it("exports batch analysis for direct download", async () => {
      mockRequest.body = {
        batchAnalysis: mockBatchAnalysis,
        format: "html",
        batchId: "batch-123"
      };
      mockRequest.query = { download: "true" };

      const mockContent = "<html>Batch Analysis</html>";
      (exportService.exportBatchAnalysis as any).mockResolvedValue(mockContent);

      await exportBatchAnalysis(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(exportService.exportBatchAnalysis).toHaveBeenCalledWith(
        mockBatchAnalysis,
        "html"
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "text/html"
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        'attachment; filename="batch_analysis_batch-123.html"'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockContent);
    });

    it("exports batch analysis and saves to file", async () => {
      mockRequest.body = {
        batchAnalysis: mockBatchAnalysis,
        format: "json"
      };

      const mockContent = JSON.stringify(mockBatchAnalysis);
      (exportService.exportBatchAnalysis as any).mockResolvedValue(mockContent);
      (exportService.saveToFile as any).mockResolvedValue("/path/to/file");

      await exportBatchAnalysis(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(exportService.exportBatchAnalysis).toHaveBeenCalledWith(
        mockBatchAnalysis,
        "json"
      );
      expect(exportService.saveToFile).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        exportId: "test-uuid",
        format: "json",
        filename: "test-uuid.json",
        downloadUrl: "/api/export/download/test-uuid",
        size: expect.any(Number)
      });
    });

    it("returns 404 when batch analysis not provided", async () => {
      mockRequest.body = {
        format: "json"
      };

      await exportBatchAnalysis(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Batch analysis not found"
      });
    });
  });

  describe("downloadExport", () => {
    it("downloads existing export file", async () => {
      mockRequest.params = { exportId: "test-export-id" };

      const mockStream = {
        pipe: vi.fn()
      };
      (fs.stat as any).mockResolvedValue({ size: 1024 });
      (fs.createReadStream as any).mockReturnValue(mockStream);

      await downloadExport(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/json"
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        'attachment; filename="test-export-id.json"'
      );
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it("returns 404 when export file not found", async () => {
      mockRequest.params = { exportId: "nonexistent-id" };

      (fs.stat as any).mockRejectedValue(new Error("File not found"));

      await downloadExport(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Export file not found"
      });
    });
  });

  describe("getExportHistory", () => {
    it("returns export history", async () => {
      await getExportHistory(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.any(Array));
    });

    it("handles errors when getting export history", async () => {
      // Mock an error in the controller logic
      const originalArray = Array.from;
      (Array as any).from = vi.fn().mockImplementation(() => {
        throw new Error("Database error");
      });

      await getExportHistory(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Failed to get export history",
        message: "Database error"
      });

      // Restore original Array.from
      (Array as any).from = originalArray;
    });
  });

  describe("deleteExport", () => {
    it("deletes existing export", async () => {
      mockRequest.params = { exportId: "test-export-id" };

      (fs.unlink as any).mockResolvedValue(undefined);

      await deleteExport(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Export deleted successfully"
      });
    });

    it("returns 404 when export not found in metadata", async () => {
      mockRequest.params = { exportId: "nonexistent-id" };

      await deleteExport(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Export not found"
      });
    });

    it("handles file deletion errors gracefully", async () => {
      mockRequest.params = { exportId: "test-export-id" };

      // First, we need to add an item to the metadata store
      // This is a bit tricky since the metadata store is internal
      // We'll need to call exportAnalysis first to populate it
      const exportRequest = {
        body: {
          analysis: mockAnalysis,
          format: "json"
        },
        query: {}
      };

      const exportResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
        sendStatus: vi.fn().mockReturnThis(),
        links: vi.fn().mockReturnThis(),
        append: vi.fn().mockReturnThis(),
        attachment: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis(),
        clearCookie: vi.fn().mockReturnThis(),
        download: vi.fn().mockReturnThis(),
        end: vi.fn().mockReturnThis(),
        format: vi.fn().mockReturnThis(),
        get: vi.fn().mockReturnThis(),
        jsonp: vi.fn().mockReturnThis(),
        location: vi.fn().mockReturnThis(),
        redirect: vi.fn().mockReturnThis(),
        render: vi.fn().mockReturnThis(),
        sendFile: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        type: vi.fn().mockReturnThis(),
        vary: vi.fn().mockReturnThis()
      } as unknown as Response;

      (exportService.exportAnalysis as any).mockResolvedValue("{}");
      (exportService.saveToFile as any).mockResolvedValue("/path/to/file");

      await exportAnalysis(
        exportRequest as Request,
        exportResponse as Response
      );

      // Now test deletion with file error
      (fs.unlink as any).mockRejectedValue(new Error("File not found"));

      await deleteExport(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Export deleted successfully"
      });
    });
  });

  describe("helper functions", () => {
    it("gets correct file extension for different formats", () => {
      // These are tested indirectly through the main functions
      // The helper functions are not exported, so we test their behavior
      // through the main controller functions

      const testCases = [
        { format: "json", expectedExt: "json" },
        { format: "markdown", expectedExt: "md" },
        { format: "html", expectedExt: "html" }
      ];

      testCases.forEach(async ({ format, expectedExt }) => {
        mockRequest.body = {
          analysis: mockAnalysis,
          format
        };

        (exportService.exportAnalysis as any).mockResolvedValue("test content");
        (exportService.saveToFile as any).mockResolvedValue("/path/to/file");

        await exportAnalysis(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            filename: `test-uuid.${expectedExt}`
          })
        );
      });
    });

    it("gets correct content type for different formats", async () => {
      const testCases = [
        { format: "json", expectedType: "application/json" },
        { format: "markdown", expectedType: "text/markdown" },
        { format: "html", expectedType: "text/html" }
      ];

      for (const { format, expectedType } of testCases) {
        vi.clearAllMocks();

        mockRequest.body = {
          analysis: mockAnalysis,
          format
        };
        mockRequest.query = { download: "true" };

        (exportService.exportAnalysis as any).mockResolvedValue("test content");

        await exportAnalysis(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          "Content-Type",
          expectedType
        );
      }
    });
  });
});
