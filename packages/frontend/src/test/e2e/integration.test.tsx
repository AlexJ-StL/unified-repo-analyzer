import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';
import { ToastProvider } from '../../contexts/ToastContext';
import * as apiService from '../../services/apiService';

// Mock API service
vi.mock('../../services/apiService');

const mockApiService = apiService as any;

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ToastProvider>{children}</ToastProvider>
  </BrowserRouter>
);

describe('End-to-End Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default API mocks
    mockApiService.analyzeRepository = vi.fn();
    mockApiService.batchAnalyzeRepositories = vi.fn();
    mockApiService.searchRepositories = vi.fn();
    mockApiService.getRepositories = vi.fn();
    mockApiService.exportAnalysis = vi.fn();
    mockApiService.getAnalysisStatus = vi.fn();
  });

  describe('Complete Analysis Workflow', () => {
    it('should complete full repository analysis workflow', async () => {
      const user = userEvent.setup();

      // Mock successful analysis
      const mockAnalysis = {
        id: 'test-analysis-1',
        name: 'test-repo',
        path: '/path/to/test-repo',
        language: 'JavaScript',
        languages: ['JavaScript', 'TypeScript'],
        frameworks: ['React', 'Node.js'],
        fileCount: 150,
        directoryCount: 25,
        totalSize: 1024000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        structure: {
          directories: [],
          keyFiles: [],
          tree: 'test-tree',
        },
        codeAnalysis: {
          functionCount: 45,
          classCount: 12,
          importCount: 89,
          complexity: {
            cyclomaticComplexity: 15,
            maintainabilityIndex: 75,
            technicalDebt: 'Low',
            codeQuality: 'good' as const,
          },
          patterns: [],
        },
        dependencies: {
          production: [],
          development: [],
          frameworks: [],
        },
        insights: {
          executiveSummary: 'Test executive summary',
          technicalBreakdown: 'Test technical breakdown',
          recommendations: ['Test recommendation'],
          potentialIssues: ['Test issue'],
        },
        metadata: {
          analysisMode: 'standard' as const,
          llmProvider: 'mock',
          processingTime: 5000,
          tokenUsage: { input: 1000, output: 500 },
        },
      };

      mockApiService.analyzeRepository.mockResolvedValue(mockAnalysis);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Wait for app to load
      await waitFor(() => {
        expect(screen.getByText(/Repository Analyzer/i)).toBeInTheDocument();
      });

      // Navigate to analysis page (assuming there's a button or link)
      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);

      // Configure analysis options
      const pathInput = screen.getByLabelText(/repository path/i);
      await user.type(pathInput, '/path/to/test-repo');

      // Start analysis
      const startButton = screen.getByRole('button', { name: /start analysis/i });
      await user.click(startButton);

      // Wait for analysis to complete
      await waitFor(
        () => {
          expect(screen.getByText('Test executive summary')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // Verify results are displayed
      expect(screen.getByText('test-repo')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument(); // file count
    });

    it('should handle batch analysis workflow', async () => {
      const user = userEvent.setup();

      const mockBatchResult = {
        id: 'batch-1',
        repositories: [
          { path: '/repo1', status: 'completed', analysis: null },
          { path: '/repo2', status: 'completed', analysis: null },
        ],
        status: 'completed' as const,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        summary: {
          total: 2,
          completed: 2,
          failed: 0,
          totalProcessingTime: 10000,
        },
      };

      mockApiService.batchAnalyzeRepositories.mockResolvedValue(mockBatchResult);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to batch analysis
      const batchButton = screen.getByRole('button', { name: /batch/i });
      await user.click(batchButton);

      // Add repositories
      const addRepoButton = screen.getByRole('button', { name: /add repository/i });
      await user.click(addRepoButton);

      // Start batch analysis
      const startBatchButton = screen.getByRole('button', { name: /start batch/i });
      await user.click(startBatchButton);

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText(/batch analysis completed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search and Discovery Workflow', () => {
    it('should complete repository search workflow', async () => {
      const user = userEvent.setup();

      const mockSearchResults = [
        {
          id: 'repo-1',
          name: 'test-repo-1',
          path: '/path/to/repo1',
          languages: ['JavaScript'],
          frameworks: ['React'],
          tags: ['frontend'],
          summary: 'Test repository 1',
          lastAnalyzed: new Date().toISOString(),
          size: 1024000,
          complexity: 5,
        },
      ];

      mockApiService.searchRepositories.mockResolvedValue({
        repositories: mockSearchResults,
        total: 1,
        page: 1,
        limit: 10,
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to search
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Perform search
      const searchInput = screen.getByPlaceholderText(/search repositories/i);
      await user.type(searchInput, 'JavaScript');

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('test-repo-1')).toBeInTheDocument();
      });

      // Apply filters
      const languageFilter = screen.getByLabelText(/javascript/i);
      await user.click(languageFilter);

      // Verify filtered results
      expect(screen.getByText('test-repo-1')).toBeInTheDocument();
    });
  });

  describe('Export and Sharing Workflow', () => {
    it('should complete export workflow', async () => {
      const user = userEvent.setup();

      const mockAnalysis = {
        id: 'test-analysis-1',
        name: 'test-repo',
        // ... other properties
      };

      const mockExportResult = {
        url: 'http://example.com/export/test.json',
        filename: 'test-repo-analysis.json',
        format: 'json' as const,
      };

      mockApiService.exportAnalysis.mockResolvedValue(mockExportResult);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Assume we're on results page with analysis data
      // Click export button
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Select format
      const jsonOption = screen.getByText(/json/i);
      await user.click(jsonOption);

      // Wait for export to complete
      await waitFor(() => {
        expect(mockApiService.exportAnalysis).toHaveBeenCalledWith(expect.any(String), 'json');
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();

      mockApiService.analyzeRepository.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Attempt analysis that will fail
      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);

      const pathInput = screen.getByLabelText(/repository path/i);
      await user.type(pathInput, '/invalid/path');

      const startButton = screen.getByRole('button', { name: /start analysis/i });
      await user.click(startButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Verify retry option is available
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle partial batch failures', async () => {
      const user = userEvent.setup();

      const mockBatchResult = {
        id: 'batch-1',
        repositories: [
          { path: '/repo1', status: 'completed', analysis: null },
          { path: '/repo2', status: 'failed', error: 'Access denied' },
        ],
        status: 'completed' as const,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        summary: {
          total: 2,
          completed: 1,
          failed: 1,
          totalProcessingTime: 5000,
        },
      };

      mockApiService.batchAnalyzeRepositories.mockResolvedValue(mockBatchResult);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Start batch analysis
      const batchButton = screen.getByRole('button', { name: /batch/i });
      await user.click(batchButton);

      const startBatchButton = screen.getByRole('button', { name: /start batch/i });
      await user.click(startBatchButton);

      // Wait for completion with partial failures
      await waitFor(() => {
        expect(screen.getByText(/1 failed/i)).toBeInTheDocument();
      });

      // Verify error details are shown
      expect(screen.getByText('Access denied')).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large datasets efficiently', async () => {
      const user = userEvent.setup();

      // Mock large dataset
      const mockLargeResults = Array.from({ length: 100 }, (_, i) => ({
        id: `repo-${i}`,
        name: `test-repo-${i}`,
        path: `/path/to/repo${i}`,
        languages: ['JavaScript'],
        frameworks: ['React'],
        tags: ['test'],
        summary: `Test repository ${i}`,
        lastAnalyzed: new Date().toISOString(),
        size: 1024000,
        complexity: 5,
      }));

      mockApiService.searchRepositories.mockResolvedValue({
        repositories: mockLargeResults.slice(0, 10), // Paginated
        total: 100,
        page: 1,
        limit: 10,
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to search
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      // Wait for initial results
      await waitFor(() => {
        expect(screen.getByText('test-repo-0')).toBeInTheDocument();
      });

      // Test pagination
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Verify pagination works
      expect(mockApiService.searchRepositories).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });

    it('should implement lazy loading for results', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Test that components are loaded lazily
      // This would be implementation-specific based on your lazy loading strategy
      expect(screen.queryByTestId('heavy-component')).not.toBeInTheDocument();

      // Trigger lazy loading
      const loadButton = screen.getByRole('button', { name: /load more/i });
      await user.click(loadButton);

      // Verify lazy component loads
      await waitFor(() => {
        expect(screen.getByTestId('heavy-component')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Test keyboard navigation
      await user.tab();
      expect(document.activeElement).toHaveAttribute('role', 'button');

      await user.tab();
      expect(document.activeElement).toHaveAttribute('type', 'text');

      // Test Enter key activation
      await user.keyboard('{Enter}');
      // Verify appropriate action was triggered
    });

    it('should provide proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check for proper ARIA attributes
      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();

      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();

      // Check for proper labeling
      const searchInput = screen.getByLabelText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should handle screen reader announcements', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Test live regions for dynamic content
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();

      // Trigger status update
      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);

      // Verify status is announced
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/analyzing/i);
      });
    });
  });

  describe('Configuration and Settings', () => {
    it('should persist user preferences', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Change settings
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsButton);

      const themeToggle = screen.getByRole('switch', { name: /dark mode/i });
      await user.click(themeToggle);

      // Verify settings are saved
      expect(localStorage.getItem('theme')).toBe('dark');

      // Reload and verify persistence
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      expect(document.body).toHaveClass('dark');
    });
  });
});
