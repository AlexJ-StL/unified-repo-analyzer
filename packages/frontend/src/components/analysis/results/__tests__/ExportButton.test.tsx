import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { RepositoryAnalysis } from "@unified-repo-analyzer/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiService } from "../../../../services/api";
import ExportButton from "../ExportButton";
import React from "react";

// Mock the API service
vi.mock("../../../../services/api", () => ({
  apiService: {
    exportAnalysis: vi.fn(),
    exportBatchAnalysis: vi.fn(),
    downloadExport: vi.fn(),
  },
  handleApiError: vi.fn((error) => error.message || "Unknown error"),
}));

// Mock window.URL and document methods
Object.defineProperty(window, "URL", {
  value: {
    createObjectURL: vi.fn(() => "mock-url"),
    revokeObjectURL: vi.fn(),
  },
});

Object.defineProperty(document, "createElement", {
  value: vi.fn(() => ({
    href: "",
    download: "",
    click: vi.fn(),
  })),
});

Object.defineProperty(document.body, "appendChild", {
  value: vi.fn(),
});

Object.defineProperty(document.body, "removeChild", {
  value: vi.fn(),
});

// Mock navigator.clipboard and navigator.share
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: vi.fn(),
  },
});

Object.defineProperty(navigator, "share", {
  value: vi.fn(),
});

const mockAnalysis: RepositoryAnalysis = {
  id: "test-id",
  name: "test-repo",
  path: "/test/path",
  language: "TypeScript",
  languages: ["TypeScript", "JavaScript"],
  frameworks: ["React"],
  fileCount: 10,
  directoryCount: 5,
  totalSize: 1024,
  createdAt: new Date(),
  updatedAt: new Date(),
  structure: {
    directories: [],
    keyFiles: [],
    tree: "test tree",
  },
  codeAnalysis: {
    functionCount: 5,
    classCount: 2,
    importCount: 10,
    complexity: {
      cyclomaticComplexity: 3,
      maintainabilityIndex: 80,
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
    executiveSummary: "Test summary",
    technicalBreakdown: "Test breakdown",
    recommendations: [],
    potentialIssues: [],
  },
  metadata: {
    analysisMode: "standard",
    processingTime: 1000,
  },
};

describe("ExportButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders export button correctly", () => {
    render(<ExportButton analysis={mockAnalysis} />);

    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("opens dropdown when clicked", async () => {
    render(<ExportButton analysis={mockAnalysis} />);

    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText("Export Options")).toBeInTheDocument();
      expect(screen.getByText("JSON")).toBeInTheDocument();
      expect(screen.getByText("Markdown")).toBeInTheDocument();
      expect(screen.getByText("HTML")).toBeInTheDocument();
    });
  });

  it("handles direct download correctly", async () => {
    const mockResponse = {
      data: new Blob(["test content"]),
    };

    (apiService.exportAnalysis as any).mockResolvedValue(mockResponse);

    render(<ExportButton analysis={mockAnalysis} />);

    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText("JSON")).toBeInTheDocument();
    });

    const downloadButtons = screen.getAllByText("Download");
    fireEvent.click(downloadButtons[0]); // Click JSON download

    await waitFor(() => {
      expect(apiService.exportAnalysis).toHaveBeenCalledWith(
        mockAnalysis,
        "json",
        true
      );
    });
  });

  it("handles export for sharing correctly", async () => {
    const mockResponse = {
      data: {
        exportId: "test-export-id",
        downloadUrl: "/api/export/download/test-export-id",
        filename: "test.json",
      },
    };

    (apiService.exportAnalysis as any).mockResolvedValue(mockResponse);

    render(<ExportButton analysis={mockAnalysis} />);

    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText("JSON")).toBeInTheDocument();
    });

    const shareButtons = screen.getAllByText("Share");
    fireEvent.click(shareButtons[0]); // Click JSON share

    await waitFor(() => {
      expect(apiService.exportAnalysis).toHaveBeenCalledWith(
        mockAnalysis,
        "json",
        false
      );
    });
  });

  it("shows loading state during export", async () => {
    const mockResponse = {
      data: new Blob(["test content"]),
    };

    // Make the API call take some time
    (apiService.exportAnalysis as any).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
    );

    render(<ExportButton analysis={mockAnalysis} />);

    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText("JSON")).toBeInTheDocument();
    });

    const downloadButtons = screen.getAllByText("Download");
    fireEvent.click(downloadButtons[0]);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText("Exporting JSON...")).toBeInTheDocument();
    });

    // Should hide loading state after completion
    await waitFor(
      () => {
        expect(screen.queryByText("Exporting JSON...")).not.toBeInTheDocument();
      },
      { timeout: 200 }
    );
  });

  it("handles export errors gracefully", async () => {
    const mockError = new Error("Export failed");
    (apiService.exportAnalysis as any).mockRejectedValue(mockError);

    // Mock window.alert
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<ExportButton analysis={mockAnalysis} />);

    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText("JSON")).toBeInTheDocument();
    });

    const downloadButtons = screen.getAllByText("Download");
    fireEvent.click(downloadButtons[0]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Export failed: Export failed");
    });

    alertSpy.mockRestore();
  });

  it("displays export history when available", async () => {
    const mockResponse = {
      data: {
        exportId: "test-export-id",
        downloadUrl: "/api/export/download/test-export-id",
        filename: "test.json",
      },
    };

    (apiService.exportAnalysis as any).mockResolvedValue(mockResponse);

    render(<ExportButton analysis={mockAnalysis} />);

    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText("JSON")).toBeInTheDocument();
    });

    const shareButtons = screen.getAllByText("Share");
    fireEvent.click(shareButtons[0]);

    await waitFor(() => {
      fireEvent.click(exportButton); // Reopen dropdown
    });

    await waitFor(() => {
      expect(screen.getByText("Recent Exports")).toBeInTheDocument();
    });
  });

  it("works with batch analysis", async () => {
    const mockBatchAnalysis = {
      id: "batch-id",
      repositories: [mockAnalysis],
      createdAt: new Date(),
      processingTime: 2000,
    };

    const mockResponse = {
      data: new Blob(["test content"]),
    };

    (apiService.exportBatchAnalysis as any).mockResolvedValue(mockResponse);

    render(<ExportButton batchAnalysis={mockBatchAnalysis} />);

    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText("JSON")).toBeInTheDocument();
    });

    const downloadButtons = screen.getAllByText("Download");
    fireEvent.click(downloadButtons[0]);

    await waitFor(() => {
      expect(apiService.exportBatchAnalysis).toHaveBeenCalledWith(
        mockBatchAnalysis,
        "json",
        true
      );
    });
  });

  it("handles sharing with native share API when available", async () => {
    const mockResponse = {
      data: {
        exportId: "test-export-id",
        downloadUrl: "/api/export/download/test-export-id",
        filename: "test.json",
      },
    };

    (apiService.exportAnalysis as any).mockResolvedValue(mockResponse);
    (navigator.share as any).mockResolvedValue(undefined);

    render(<ExportButton analysis={mockAnalysis} />);

    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText("JSON")).toBeInTheDocument();
    });

    const shareButtons = screen.getAllByText("Share");
    fireEvent.click(shareButtons[0]);

    await waitFor(() => {
      expect(navigator.share).toHaveBeenCalledWith({
        title: "Repository Analysis - test-repo",
        text: "Check out this repository analysis",
        url: `${window.location.origin}/api/export/download/test-export-id`,
      });
    });
  });

  it("falls back to clipboard when native share is not available", async () => {
    const mockResponse = {
      data: {
        exportId: "test-export-id",
        downloadUrl: "/api/export/download/test-export-id",
        filename: "test.json",
      },
    };

    (apiService.exportAnalysis as any).mockResolvedValue(mockResponse);

    // Remove navigator.share to test fallback
    const originalShare = navigator.share;
    delete (navigator as any).share;

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<ExportButton analysis={mockAnalysis} />);

    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(screen.getByText("JSON")).toBeInTheDocument();
    });

    const shareButtons = screen.getAllByText("Share");
    fireEvent.click(shareButtons[0]);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        `${window.location.origin}/api/export/download/test-export-id`
      );
      expect(alertSpy).toHaveBeenCalledWith("Share link copied to clipboard!");
    });

    // Restore navigator.share
    (navigator as any).share = originalShare;
    alertSpy.mockRestore();
  });
});
