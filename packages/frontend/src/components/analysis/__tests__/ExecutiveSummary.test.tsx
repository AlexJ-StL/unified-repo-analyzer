import { render, screen } from '@testing-library/react';
import type { RepositoryAnalysis } from '@unified-repo-analyzer/shared';
import { describe, expect, test, vi } from 'vitest';
import ExecutiveSummary from '../results/ExecutiveSummary';

// Mock ReactMarkdown to avoid issues with markdown parsing in tests
// This vi should be the one from the vitest import, not the global (if global is broken)
vi.doMock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
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
    executiveSummary: 'Test executive summary',
    technicalBreakdown: 'Test breakdown',
    recommendations: ['Recommendation 1', 'Recommendation 2'],
    potentialIssues: ['Issue 1', 'Issue 2'],
  },
  metadata: {
    analysisMode: 'standard',
    processingTime: 1000,
  },
} as RepositoryAnalysis;

describe('ExecutiveSummary', () => {
  test('renders repository overview', () => {
    render(<ExecutiveSummary analysis={mockAnalysis} />);

    expect(screen.getByText('Repository Overview')).toBeInTheDocument();
    expect(screen.getByText('Name:')).toBeInTheDocument();
    expect(screen.getByText('test-repo')).toBeInTheDocument();
    expect(screen.getByText('Primary Language:')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Languages:')).toBeInTheDocument();
    expect(screen.getByText('TypeScript, JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Files:')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Directories:')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  test('renders executive summary content', () => {
    render(<ExecutiveSummary analysis={mockAnalysis} />);

    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    expect(screen.getByTestId('markdown')).toHaveTextContent('Test executive summary');
  });

  test('renders recommendations', () => {
    render(<ExecutiveSummary analysis={mockAnalysis} />);

    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Recommendation 1')).toBeInTheDocument();
    expect(screen.getByText('Recommendation 2')).toBeInTheDocument();
  });

  test('renders potential issues', () => {
    render(<ExecutiveSummary analysis={mockAnalysis} />);

    expect(screen.getByText('Potential Issues')).toBeInTheDocument();
    expect(screen.getByText('Issue 1')).toBeInTheDocument();
    expect(screen.getByText('Issue 2')).toBeInTheDocument();
  });

  test('renders frameworks', () => {
    render(<ExecutiveSummary analysis={mockAnalysis} />);

    expect(screen.getByText('Frameworks & Technologies')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Express')).toBeInTheDocument();
  });
});
