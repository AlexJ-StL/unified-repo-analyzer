vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>();
  return {
    ...actual,
    createReadStream: vi.fn(() => {
      const { Readable } = require('node:stream');
      const stream = new Readable();
      stream.push(null);
      return stream;
    }),
    stat: vi.fn(),
    mkdir: vi.fn(),
    readdir: vi.fn(),
    unlink: vi.fn(),
  };
});

import type { ReadStream } from 'node:fs';
import * as fs from 'node:fs';
import type { Request, Response } from 'express';
import { type MockedFunction, vi } from 'vitest';
import exportService from '../../../services/export.service';
import {
  clearExportMetadata,
  deleteExport,
  downloadExport,
  exportAnalysis,
  exportBatchAnalysis,
  exportMetadata,
  getExportHistory,
} from '../export.controller';

// Mock the export service
vi.mock('../../../services/export.service', () => ({
  default: {
    exportAnalysis: vi.fn(),
    exportBatchAnalysis: vi.fn(),
    saveToFile: vi.fn(),
  },
}));

const mockExportService = exportService as unknown as {
  exportAnalysis: MockedFunction<Promise<string>>;
  exportBatchAnalysis: MockedFunction<Promise<string>>;
  saveToFile: MockedFunction<Promise<string>>;
};

// Removed duplicate fs mock - using the one at the top
// Duplicate fs mock removed - using the one at the top of the file
// Mock fs
vi.mock('node:fs', () => ({
  createReadStream: vi.fn(() => {
    const { Readable } = require('node:stream');
    const stream = new Readable();
    stream.push(null);
    return stream;
  }),
  stat: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn(),
  unlink: vi.fn(),
}));

// Mock express-validator
vi.mock('express-validator', () => ({
  validationResult: vi.fn(() => ({
    isEmpty: () => true,
    array: () => [],
  })),
}));

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid'),
}));

const mockAnalysis = {
  id: 'test-id',
  name: 'test-repo',
  path: '/test/path',
  language: 'TypeScript',
  languages: ['TypeScript'],
  frameworks: ['React'],
  fileCount: 10,
  directoryCount: 5,
  totalSize: 1024,
  createdAt: new Date(),
  updatedAt: new Date(),
  structure: { directories: [], keyFiles: [], tree: 'test' },
  codeAnalysis: {
    functionCount: 5,
    classCount: 2,
    importCount: 10,
    complexity: {
      cyclomaticComplexity: 3,
      maintainabilityIndex: 80,
      technicalDebt: 'Low',
      codeQuality: 'good' as const,
    },
    patterns: [],
  },
  dependencies: { production: [], development: [], frameworks: [] },
  insights: {
    executiveSummary: 'Test summary',
    technicalBreakdown: 'Test breakdown',
    recommendations: [],
    potentialIssues: [],
  },
  metadata: {
    analysisMode: 'standard' as const,
    processingTime: 1000,
  },
};

const mockBatchAnalysis = {
  id: 'batch-id',
  repositories: [mockAnalysis],
  createdAt: new Date(),
  processingTime: 2000,
};

describe('Export Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
      sendStatus: vi.fn().mockReturnThis(),
    } as unknown as Response;

    vi.clearAllMocks();
    clearExportMetadata();
  });

  describe('exportAnalysis', () => {
    it('exports analysis for direct download', async () => {
      mockRequest.body = {
        analysis: mockAnalysis,
        format: 'json',
      };
      mockRequest.query = { download: 'true' };

      const mockContent = JSON.stringify(mockAnalysis);
      mockExportService.exportAnalysis.mockResolvedValue(mockContent);

      await exportAnalysis(mockRequest as Request, mockResponse as Response);

      expect(mockExportService.exportAnalysis).toHaveBeenCalledWith(mockAnalysis, 'json');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="test_repo_analysis.json"'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockContent);
    });

    it('exports analysis and saves to file', async () => {
      mockRequest.body = {
        analysis: mockAnalysis,
        format: 'markdown',
      };

      const mockContent = '# Test Analysis';
      mockExportService.exportAnalysis.mockResolvedValue(mockContent);
      mockExportService.saveToFile.mockResolvedValue('/path/to/file');

      await exportAnalysis(mockRequest as Request, mockResponse as Response);

      expect(mockExportService.exportAnalysis).toHaveBeenCalledWith(mockAnalysis, 'markdown');
      expect(mockExportService.saveToFile).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        exportId: 'test-uuid',
        format: 'markdown',
        filename: 'test-uuid.md',
        downloadUrl: '/api/export/download/test-uuid',
        size: expect.any(Number),
      });
    });

    it('returns 404 when analysis not provided', async () => {
      mockRequest.body = {
        format: 'json',
      };

      await exportAnalysis(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Analysis not found',
      });
    });

    it('handles export service errors', async () => {
      mockRequest.body = {
        analysis: mockAnalysis,
        format: 'json',
      };

      const mockError = new Error('Export failed');
      mockExportService.exportAnalysis.mockRejectedValue(mockError);

      await exportAnalysis(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to export analysis',
        message: 'Export failed',
      });
    });
  });

  describe('exportBatchAnalysis', () => {
    it('exports batch analysis for direct download', async () => {
      mockRequest.body = {
        batchAnalysis: mockBatchAnalysis,
        format: 'html',
        batchId: 'batch-123',
      };
      mockRequest.query = { download: 'true' };

      const mockContent = '<html>Batch Analysis</html>';
      mockExportService.exportBatchAnalysis.mockResolvedValue(mockContent);

      await exportBatchAnalysis(mockRequest as Request, mockResponse as Response);

      expect(mockExportService.exportBatchAnalysis).toHaveBeenCalledWith(mockBatchAnalysis, 'html');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="batch_analysis_batch-123.html"'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockContent);
    });

    it('exports batch analysis and saves to file', async () => {
      mockRequest.body = {
        batchAnalysis: mockBatchAnalysis,
        format: 'json',
      };

      const mockContent = JSON.stringify(mockBatchAnalysis);
      mockExportService.exportBatchAnalysis.mockResolvedValue(mockContent);
      mockExportService.saveToFile.mockResolvedValue('/path/to/file');

      await exportBatchAnalysis(mockRequest as Request, mockResponse as Response);

      expect(mockExportService.exportBatchAnalysis).toHaveBeenCalledWith(mockBatchAnalysis, 'json');
      expect(mockExportService.saveToFile).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        exportId: 'test-uuid',
        format: 'json',
        filename: 'test-uuid.json',
        downloadUrl: '/api/export/download/test-uuid',
        size: expect.any(Number),
      });
    });

    it('returns 404 when batch analysis not provided', async () => {
      mockRequest.body = {
        format: 'json',
      };

      await exportBatchAnalysis(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Batch analysis not found',
      });
    });
  });

  describe('downloadExport', () => {
    it('downloads existing export file', async () => {
      const exportId = 'test-export-id';
      mockRequest.params = { exportId };

      const mockStream = {
        pipe: vi.fn(),
      };
      vi.mocked(fs.stat).mockResolvedValue({ size: 1024 } as Awaited<ReturnType<typeof fs.stat>>);
      vi.mocked(fs.createReadStream).mockReturnValue(mockStream as ReadStream);

      exportMetadata.set(exportId, {
        id: exportId,
        format: 'json',
        filename: `${exportId}.json`,
        createdAt: new Date(),
        size: 1024,
        type: 'single',
      });

      await downloadExport(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        `attachment; filename="${exportId}.json"`
      );
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it('returns 404 when export file not found', async () => {
      const exportId = 'nonexistent-id';
      mockRequest.params = { exportId };

      exportMetadata.set(exportId, {
        id: exportId,
        format: 'json',
        filename: `${exportId}.json`,
        createdAt: new Date(),
        size: 1024,
        type: 'single',
      });

      vi.mocked(fs.stat).mockRejectedValue(new Error('File not found'));

      await downloadExport(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Export file not found',
      });
    });
  });

  describe('getExportHistory', () => {
    it('returns export history', async () => {
      await getExportHistory(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    it('handles errors when getting export history', async () => {
      vi.spyOn(Array, 'from').mockImplementation(() => {
        throw new Error('Database error');
      });

      await getExportHistory(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Failed to get export history',
        message: 'Database error',
      });
    });
  });

  describe('deleteExport', () => {
    it('deletes existing export', async () => {
      const exportId = 'test-export-id';
      mockRequest.params = { exportId };

      exportMetadata.set(exportId, {
        id: exportId,
        format: 'json',
        filename: `${exportId}.json`,
        createdAt: new Date(),
        size: 1024,
        type: 'single',
      });

      vi.mocked(fs.unlink).mockResolvedValue(undefined);

      await deleteExport(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Export deleted successfully',
      });
    });

    it('returns 404 when export not found in metadata', async () => {
      mockRequest.params = { exportId: 'nonexistent-id' };

      await deleteExport(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Export not found',
      });
    });

    it('handles file deletion errors gracefully', async () => {
      const exportId = 'test-export-id';
      mockRequest.params = { exportId };

      exportMetadata.set(exportId, {
        id: exportId,
        format: 'json',
        filename: `${exportId}.json`,
        createdAt: new Date(),
        size: 1024,
        type: 'single',
      });

      vi.mocked(fs.unlink).mockRejectedValue(new Error('File not found'));

      await deleteExport(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Export deleted successfully',
      });
    });
  });

  describe('helper functions', () => {
    it('gets correct file extension for different formats', async () => {
      const testCases = [
        { format: 'json', expectedExt: 'json' },
        { format: 'markdown', expectedExt: 'md' },
        { format: 'html', expectedExt: 'html' },
      ];

      for (const { format, expectedExt } of testCases) {
        mockRequest.body = {
          analysis: mockAnalysis,
          format,
        };

        mockExportService.exportAnalysis.mockResolvedValue('test content');
        mockExportService.saveToFile.mockResolvedValue('/path/to/file');

        await exportAnalysis(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            filename: `test-uuid.${expectedExt}`,
          })
        );
      }
    });

    it('gets correct content type for different formats', async () => {
      const testCases = [
        { format: 'json', expectedType: 'application/json' },
        { format: 'markdown', expectedType: 'text/markdown' },
        { format: 'html', expectedType: 'text/html' },
      ];

      for (const { format, expectedType } of testCases) {
        vi.clearAllMocks();

        mockRequest.body = {
          analysis: mockAnalysis,
          format,
        };
        mockRequest.query = { download: 'true' };

        mockExportService.exportAnalysis.mockResolvedValue('test content');

        await exportAnalysis(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', expectedType);
      }
    });
  });
});
