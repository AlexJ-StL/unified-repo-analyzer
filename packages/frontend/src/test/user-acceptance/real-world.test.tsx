import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../App';
import { ToastProvider } from '../../hooks/useToast';
import * as apiService from '../../services/apiService';

// Mock API service
vi.mock('../../services/apiService');
const mockApiService = apiService as typeof apiService & {
  analyzeRepository: ReturnType<typeof vi.fn>;
  getAnalysisStatus: ReturnType<typeof vi.fn>;
  getRepositoryList: ReturnType<typeof vi.fn>;
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ToastProvider>{children}</ToastProvider>
  </BrowserRouter>
);

// Real-world test data
const realWorldRepositories = [
  {
    id: 'react-repo',
    name: 'react-frontend',
    path: '/projects/react-frontend',
    languages: ['JavaScript', 'TypeScript', 'CSS'],
    frameworks: ['React', 'Webpack', 'Jest'],
    fileCount: 247,
    directoryCount: 32,
    totalSize: 15728640, // ~15MB
    structure: {
      directories: [
        { name: 'src', path: '/src', fileCount: 156 },
        { name: 'public', path: '/public', fileCount: 8 },
        { name: 'tests', path: '/__tests__', fileCount: 45 },
      ],
      keyFiles: [
        { path: '/package.json', language: 'JSON', importance: 10 },
        { path: '/src/App.tsx', language: 'TypeScript', importance: 9 },
        { path: '/README.md', language: 'Markdown', importance: 8 },
      ],
      tree: 'react-frontend/\n├── src/\n│   ├── components/\n│   └── utils/\n├── public/\n└── __tests__/',
    },
    insights: {
      executiveSummary:
        'Modern React application with TypeScript, comprehensive testing, and modular architecture.',
      technicalBreakdown:
        'Uses React 18 with hooks, TypeScript for type safety, Jest for testing, and Webpack for bundling.',
      recommendations: [
        'Consider implementing code splitting for better performance',
        'Add more integration tests for critical user flows',
        'Update dependencies to latest versions',
      ],
      potentialIssues: [
        'Some components lack proper error boundaries',
        'Bundle size could be optimized',
      ],
    },
  },
  {
    id: 'node-api',
    name: 'node-backend-api',
    path: '/projects/node-backend-api',
    languages: ['JavaScript', 'TypeScript'],
    frameworks: ['Express', 'MongoDB', 'Jest'],
    fileCount: 89,
    directoryCount: 18,
    totalSize: 8388608, // ~8MB
    structure: {
      directories: [
        { name: 'src', path: '/src', fileCount: 67 },
        { name: 'tests', path: '/tests', fileCount: 22 },
      ],
      keyFiles: [
        { path: '/package.json', language: 'JSON', importance: 10 },
        { path: '/src/server.js', language: 'JavaScript', importance: 9 },
        { path: '/src/routes/api.js', language: 'JavaScript', importance: 8 },
      ],
      tree: 'node-backend-api/\n├── src/\n│   ├── routes/\n│   ├── models/\n│   └── middleware/\n└── tests/',
    },
    insights: {
      executiveSummary:
        'RESTful API built with Node.js and Express, using MongoDB for data persistence.',
      technicalBreakdown:
        'Express server with modular routing, MongoDB integration, JWT authentication, and comprehensive API testing.',
      recommendations: [
        'Implement rate limiting for API endpoints',
        'Add API documentation with Swagger',
        'Consider implementing caching layer',
      ],
      potentialIssues: [
        'Missing input validation on some endpoints',
        'Error handling could be more consistent',
      ],
    },
  },
  {
    id: 'python-ml',
    name: 'python-ml-project',
    path: '/projects/python-ml-project',
    languages: ['Python'],
    frameworks: ['TensorFlow', 'Pandas', 'Flask'],
    fileCount: 156,
    directoryCount: 24,
    totalSize: 52428800, // ~50MB
    structure: {
      directories: [
        { name: 'src', path: '/src', fileCount: 89 },
        { name: 'data', path: '/data', fileCount: 12 },
        { name: 'models', path: '/models', fileCount: 34 },
        { name: 'tests', path: '/tests', fileCount: 21 },
      ],
      keyFiles: [
        { path: '/requirements.txt', language: 'Text', importance: 10 },
        { path: '/src/main.py', language: 'Python', importance: 9 },
        { path: '/src/model.py', language: 'Python', importance: 8 },
      ],
      tree: 'python-ml-project/\n├── src/\n├── data/\n├── models/\n└── tests/',
    },
    insights: {
      executiveSummary:
        'Machine learning project using TensorFlow for model training and Flask for API serving.',
      technicalBreakdown:
        'Data preprocessing with Pandas, neural network implementation with TensorFlow, and REST API with Flask.',
      recommendations: [
        'Implement model versioning and tracking',
        'Add data validation and preprocessing pipelines',
        'Consider containerization for deployment',
      ],
      potentialIssues: [
        'Large model files not properly managed',
        'Missing data backup and recovery procedures',
      ],
    },
  },
];

describe('User Acceptance Tests - Real World Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup realistic API responses
    mockApiService.getRepositories = vi.fn().mockResolvedValue({
      repositories: realWorldRepositories,
      total: realWorldRepositories.length,
    });

    mockApiService.searchRepositories = vi.fn().mockImplementation(({ query, filters }) => {
      let filtered = realWorldRepositories;

      if (query) {
        filtered = filtered.filter(
          (repo) =>
            repo.name.toLowerCase().includes(query.toLowerCase()) ||
            repo.languages.some((lang) => lang.toLowerCase().includes(query.toLowerCase())) ||
            repo.frameworks.some((fw) => fw.toLowerCase().includes(query.toLowerCase()))
        );
      }

      if (filters?.languages?.length) {
        filtered = filtered.filter((repo) =>
          filters.languages.some((lang: string) => repo.languages.includes(lang))
        );
      }

      return Promise.resolve({
        repositories: filtered,
        total: filtered.length,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('Developer Workflow - Frontend Developer', () => {
    it('should help frontend developer analyze React project', async () => {
      const user = userEvent.setup();

      mockApiService.analyzeRepository = vi.fn().mockResolvedValue(realWorldRepositories[0]);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Developer wants to analyze their React project
      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);

      // Enter project path
      const pathInput = screen.getByLabelText(/repository path/i);
      await user.type(pathInput, '/projects/react-frontend');

      // Configure for comprehensive analysis
      const modeSelect = screen.getByLabelText(/analysis mode/i);
      await user.selectOptions(modeSelect, 'comprehensive');

      // Start analysis
      const startButton = screen.getByRole('button', {
        name: /start analysis/i,
      });
      await user.click(startButton);

      // Wait for results
      await waitFor(
        () => {
          expect(screen.getByText('Modern React application')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // Verify key insights are shown
      expect(screen.getByText(/React 18 with hooks/)).toBeInTheDocument();
      expect(screen.getByText(/code splitting/)).toBeInTheDocument();
      expect(screen.getByText(/247/)).toBeInTheDocument(); // file count

      // Developer exports results for team review
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      const markdownOption = screen.getByText(/markdown/i);
      await user.click(markdownOption);

      expect(mockApiService.exportAnalysis).toHaveBeenCalledWith('react-repo', 'markdown');
    });
  });

  describe('Team Lead Workflow - Batch Analysis', () => {
    it('should help team lead analyze multiple projects', async () => {
      const user = userEvent.setup();

      mockApiService.batchAnalyzeRepositories = vi.fn().mockResolvedValue({
        id: 'batch-analysis-1',
        repositories: realWorldRepositories.map((repo) => ({
          path: repo.path,
          status: 'completed' as const,
          analysis: repo,
        })),
        status: 'completed' as const,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 30000).toISOString(),
        summary: {
          total: 3,
          completed: 3,
          failed: 0,
          totalProcessingTime: 30000,
        },
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Team lead wants to analyze all team projects
      const batchButton = screen.getByRole('button', { name: /batch/i });
      await user.click(batchButton);

      // Add multiple repositories
      for (const repo of realWorldRepositories) {
        const addButton = screen.getByRole('button', {
          name: /add repository/i,
        });
        await user.click(addButton);

        const pathInput = screen.getByDisplayValue(''); // Latest empty input
        await user.type(pathInput, repo.path);
      }

      // Start batch analysis
      const startBatchButton = screen.getByRole('button', {
        name: /start batch/i,
      });
      await user.click(startBatchButton);

      // Wait for completion
      await waitFor(
        () => {
          expect(screen.getByText(/3 completed/)).toBeInTheDocument();
        },
        { timeout: 15000 }
      );

      // Verify all projects are analyzed
      expect(screen.getByText('react-frontend')).toBeInTheDocument();
      expect(screen.getByText('node-backend-api')).toBeInTheDocument();
      expect(screen.getByText('python-ml-project')).toBeInTheDocument();

      // Export combined report
      const exportAllButton = screen.getByRole('button', {
        name: /export all/i,
      });
      await user.click(exportAllButton);

      const htmlOption = screen.getByText(/html/i);
      await user.click(htmlOption);
    });
  });

  describe('Architect Workflow - Technology Discovery', () => {
    it('should help architect discover technology patterns', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Architect wants to search for JavaScript projects
      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      const searchInput = screen.getByPlaceholderText(/search repositories/i);
      await user.type(searchInput, 'JavaScript');

      // Wait for search results
      await waitFor(() => {
        expect(screen.getByText('react-frontend')).toBeInTheDocument();
        expect(screen.getByText('node-backend-api')).toBeInTheDocument();
      });

      // Filter by React framework
      const reactFilter = screen.getByLabelText(/react/i);
      await user.click(reactFilter);

      // Should show only React projects
      await waitFor(() => {
        expect(screen.getByText('react-frontend')).toBeInTheDocument();
        expect(screen.queryByText('node-backend-api')).not.toBeInTheDocument();
      });

      // View project details
      const viewButton = screen.getByRole('button', { name: /view details/i });
      await user.click(viewButton);

      // Should show comprehensive project information
      expect(screen.getByText(/Modern React application/)).toBeInTheDocument();
      expect(screen.getByText(/TypeScript for type safety/)).toBeInTheDocument();
    });
  });

  describe('New Developer Workflow - Learning from Codebase', () => {
    it('should help new developer understand project structure', async () => {
      const user = userEvent.setup();

      mockApiService.analyzeRepository = vi.fn().mockResolvedValue(realWorldRepositories[1]);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // New developer analyzes Node.js API project
      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);

      const pathInput = screen.getByLabelText(/repository path/i);
      await user.type(pathInput, '/projects/node-backend-api');

      // Use standard mode for quick overview
      const modeSelect = screen.getByLabelText(/analysis mode/i);
      await user.selectOptions(modeSelect, 'standard');

      const startButton = screen.getByRole('button', {
        name: /start analysis/i,
      });
      await user.click(startButton);

      // Wait for analysis
      await waitFor(() => {
        expect(screen.getByText(/RESTful API built with Node.js/)).toBeInTheDocument();
      });

      // Check project structure understanding
      expect(screen.getByText(/Express server with modular routing/)).toBeInTheDocument();
      expect(screen.getByText(/MongoDB integration/)).toBeInTheDocument();
      expect(screen.getByText(/JWT authentication/)).toBeInTheDocument();

      // View file tree for navigation
      const treeButton = screen.getByRole('button', { name: /file tree/i });
      await user.click(treeButton);

      expect(screen.getByText(/routes\//)).toBeInTheDocument();
      expect(screen.getByText(/models\//)).toBeInTheDocument();
      expect(screen.getByText(/middleware\//)).toBeInTheDocument();

      // Check recommendations for learning
      expect(screen.getByText(/rate limiting/)).toBeInTheDocument();
      expect(screen.getByText(/API documentation/)).toBeInTheDocument();
    });
  });

  describe('DevOps Engineer Workflow - Deployment Analysis', () => {
    it('should help DevOps engineer assess deployment readiness', async () => {
      const user = userEvent.setup();

      mockApiService.analyzeRepository = vi.fn().mockResolvedValue(realWorldRepositories[2]);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // DevOps engineer analyzes ML project for deployment
      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);

      const pathInput = screen.getByLabelText(/repository path/i);
      await user.type(pathInput, '/projects/python-ml-project');

      // Use comprehensive mode for deployment assessment
      const modeSelect = screen.getByLabelText(/analysis mode/i);
      await user.selectOptions(modeSelect, 'comprehensive');

      const startButton = screen.getByRole('button', {
        name: /start analysis/i,
      });
      await user.click(startButton);

      // Wait for analysis
      await waitFor(() => {
        expect(screen.getByText(/Machine learning project/)).toBeInTheDocument();
      });

      // Check deployment-related insights
      expect(screen.getByText(/containerization for deployment/)).toBeInTheDocument();
      expect(screen.getByText(/model versioning/)).toBeInTheDocument();
      expect(screen.getByText(/data backup and recovery/)).toBeInTheDocument();

      // Check file size concerns
      expect(screen.getByText(/50MB/)).toBeInTheDocument(); // Large project size
      expect(screen.getByText(/Large model files/)).toBeInTheDocument();

      // Export deployment checklist
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      const jsonOption = screen.getByText(/json/i);
      await user.click(jsonOption);

      expect(mockApiService.exportAnalysis).toHaveBeenCalledWith('python-ml', 'json');
    });
  });

  describe('Project Manager Workflow - Progress Tracking', () => {
    it('should help project manager track project health', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Project manager views all projects
      const dashboardButton = screen.getByRole('button', {
        name: /dashboard/i,
      });
      await user.click(dashboardButton);

      // Wait for project list
      await waitFor(() => {
        expect(screen.getByText('react-frontend')).toBeInTheDocument();
        expect(screen.getByText('node-backend-api')).toBeInTheDocument();
        expect(screen.getByText('python-ml-project')).toBeInTheDocument();
      });

      // Check project health indicators
      const healthIndicators = screen.getAllByTestId('health-indicator');
      expect(healthIndicators.length).toBe(3);

      // Sort by complexity to identify problem areas
      const sortSelect = screen.getByLabelText(/sort by/i);
      await user.selectOptions(sortSelect, 'complexity');

      // View project comparison
      const compareButton = screen.getByRole('button', { name: /compare/i });
      await user.click(compareButton);

      // Select projects to compare
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // React project
      await user.click(checkboxes[1]); // Node project

      const startCompareButton = screen.getByRole('button', {
        name: /start comparison/i,
      });
      await user.click(startCompareButton);

      // Wait for comparison results
      await waitFor(() => {
        expect(screen.getByText(/similarities/i)).toBeInTheDocument();
        expect(screen.getByText(/differences/i)).toBeInTheDocument();
      });

      // Check technology overlap
      expect(screen.getByText(/JavaScript/)).toBeInTheDocument();
      expect(screen.getByText(/TypeScript/)).toBeInTheDocument();
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    it('should handle network failures gracefully', async () => {
      const user = userEvent.setup();

      // Simulate network failure
      mockApiService.analyzeRepository = vi
        .fn()
        .mockRejectedValue(new Error('Network connection failed'));

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);

      const pathInput = screen.getByLabelText(/repository path/i);
      await user.type(pathInput, '/projects/test-repo');

      const startButton = screen.getByRole('button', {
        name: /start analysis/i,
      });
      await user.click(startButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/network connection failed/i)).toBeInTheDocument();
      });

      // Should provide retry option
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();

      // Fix network and retry
      mockApiService.analyzeRepository = vi.fn().mockResolvedValue(realWorldRepositories[0]);
      await user.click(retryButton);

      // Should succeed on retry
      await waitFor(() => {
        expect(screen.getByText(/Modern React application/)).toBeInTheDocument();
      });
    });

    it('should handle large repository analysis', async () => {
      const user = userEvent.setup();

      const largeRepo = {
        ...realWorldRepositories[0],
        fileCount: 5000,
        directoryCount: 500,
        totalSize: 104857600, // 100MB
        insights: {
          ...realWorldRepositories[0].insights,
          potentialIssues: [
            'Repository is very large and may impact performance',
            'Consider splitting into multiple repositories',
            'Build times may be slow due to size',
          ],
        },
      };

      mockApiService.analyzeRepository = vi.fn().mockResolvedValue(largeRepo);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);

      const pathInput = screen.getByLabelText(/repository path/i);
      await user.type(pathInput, '/projects/large-monorepo');

      const startButton = screen.getByRole('button', {
        name: /start analysis/i,
      });
      await user.click(startButton);

      // Should show progress for large repository
      await waitFor(() => {
        expect(screen.getByText(/analyzing large repository/i)).toBeInTheDocument();
      });

      // Wait for completion
      await waitFor(
        () => {
          expect(screen.getByText(/5000/)).toBeInTheDocument(); // file count
          expect(screen.getByText(/100MB/)).toBeInTheDocument(); // size warning
        },
        { timeout: 15000 }
      );

      // Should show size-related recommendations
      expect(screen.getByText(/splitting into multiple repositories/)).toBeInTheDocument();
      expect(screen.getByText(/Build times may be slow/)).toBeInTheDocument();
    });

    it('should handle corrupted or inaccessible repositories', async () => {
      const user = userEvent.setup();

      mockApiService.analyzeRepository = vi
        .fn()
        .mockRejectedValue(new Error('Permission denied: Cannot access repository'));

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);

      const pathInput = screen.getByLabelText(/repository path/i);
      await user.type(pathInput, '/restricted/private-repo');

      const startButton = screen.getByRole('button', {
        name: /start analysis/i,
      });
      await user.click(startButton);

      // Wait for permission error
      await waitFor(() => {
        expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
      });

      // Should provide helpful guidance
      expect(screen.getByText(/check repository permissions/i)).toBeInTheDocument();
      expect(screen.getByText(/verify path exists/i)).toBeInTheDocument();
    });
  });
});
