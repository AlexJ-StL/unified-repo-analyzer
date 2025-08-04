import { fireEvent, render, screen } from '@testing-library/react';
import type { RepositoryAnalysis } from '@unified-repo-analyzer/shared';
import { vi } from 'vitest';
import ResultsViewer from '../ResultsViewer';

// Mock the child components
vi.mock('../results/ExecutiveSummary', () => ({
  __esModule: true,
  default: () => <div data-testid="executive-summary">Executive Summary Mock</div>,
}));

vi.mock('../results/TechnicalBreakdown', () => ({
  __esModule: true,
  default: () => <div data-testid="technical-breakdown">Technical Breakdown Mock</div>,
}));

vi.mock('../results/FileTreeViewer', () => ({
  __esModule: true,
  default: () => <div data-testid="file-tree-viewer">File Tree Viewer Mock</div>,
}));

vi.mock('../results/DependencyGraph', () => ({
  __esModule: true,
  default: () => <div data-testid="dependency-graph">Dependency Graph Mock</div>,
}));

// Mock analysis data
const mockAnalysis = {
  id: 'test-id',
  name: 'test-repo',
  path: '/path/to/repo',
  language: 'TypeScript',
  languages: ['TypeScript', 'JavaScript'],
  frameworks: ['React', 'Express'],
  fileCount: 100,
  directoryCount: 20,
  totalSize: 1024000,
  createdAt: new Date(),
  updatedAt: new Date(),
  structure: {
    directories: [],
    keyFiles: [],
    tree: '',
  },
  codeAnalysis: {
    functionCount: 50,
    classCount: 10,
    importCount: 100,
    complexity: {
      cyclomaticComplexity: 10,
      maintainabilityIndex: 85,
      technicalDebt: 'Low',
      codeQuality: 'good',
    },
    patterns: [],
  },
  dependencies: {
    production: [],
    development: [],
    frameworks: [],
  },
  insights: {
    executiveSummary: 'Test summary',
    technicalBreakdown: 'Test breakdown',
    recommendations: [],
    potentialIssues: [],
  },
  metadata: {
    analysisMode: 'standard',
    processingTime: 1000,
  },
} as RepositoryAnalysis;

describe('ResultsViewer', () => {
  test('renders without crashing', () => {
    render(<ResultsViewer analysis={mockAnalysis} />);
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
  });

  test('shows executive summary by default', () => {
    render(<ResultsViewer analysis={mockAnalysis} />);
    expect(screen.getByTestId('executive-summary')).toBeInTheDocument();
  });

  test('switches tabs when clicked', () => {
    render(<ResultsViewer analysis={mockAnalysis} />);

    // Initially shows executive summary
    expect(screen.getByTestId('executive-summary')).toBeInTheDocument();

    // Click on Technical Breakdown tab
    fireEvent.click(screen.getByText('Technical Breakdown'));
    expect(screen.getByTestId('technical-breakdown')).toBeInTheDocument();

    // Click on File Structure tab
    fireEvent.click(screen.getByText('File Structure'));
    expect(screen.getByTestId('file-tree-viewer')).toBeInTheDocument();

    // Click on Dependencies tab
    fireEvent.click(screen.getByText('Dependencies'));
    expect(screen.getByTestId('dependency-graph')).toBeInTheDocument();
  });

  test('displays message when no analysis is provided', () => {
    render(<ResultsViewer analysis={null as unknown as RepositoryAnalysis} />);
    expect(screen.getByText('No analysis results available.')).toBeInTheDocument();
  });
});
