import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import AnalysisRequests from '../AnalysisRequests';

// Mock the useAnalysisRequests hook
const mockUseAnalysisRequests = vi.fn();

vi.mock('../../../hooks/useAnalysisRequests', () => ({
  useAnalysisRequests: () => mockUseAnalysisRequests(),
}));

describe('AnalysisRequests', () => {
  const mockRequests = [
    {
      id: 'req-12345678-1234-5678-9012-123456789012',
      path: '/test/project1',
      options: {},
      status: 'completed',
      progress: 100,
      startTime: '2023-01-01T10:00:00Z',
      endTime: '2023-01-01T10:01:00Z',
      processingTime: 60000,
    },
    {
      id: 'req-87654321-4321-8765-4321-210987654321',
      path: '/test/project2',
      options: {},
      status: 'processing',
      progress: 75,
      startTime: '2023-01-01T10:05:00Z',
      currentFile: 'src/main.js',
    },
  ];

  const mockStats = {
    total: 2,
    queued: 0,
    processing: 1,
    completed: 1,
    failed: 0,
    cancelled: 0,
    averageProcessingTime: 60000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render loading state', () => {
    mockUseAnalysisRequests.mockReturnValue({
      requests: [],
      stats: null,
      loading: true,
      error: null,
      refreshRequests: vi.fn(),
      refreshStats: vi.fn(),
      getRequest: vi.fn(),
    });

    render(<AnalysisRequests />);

    expect(screen.getByText('Loading analysis requests...')).toBeInTheDocument();
  });

  test('should render error state', () => {
    mockUseAnalysisRequests.mockReturnValue({
      requests: [],
      stats: null,
      loading: false,
      error: 'Failed to fetch requests',
      refreshRequests: vi.fn(),
      refreshStats: vi.fn(),
      getRequest: vi.fn(),
    });

    render(<AnalysisRequests />);

    expect(screen.getByText('Error: Failed to fetch requests')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  test('should render requests and stats', async () => {
    mockUseAnalysisRequests.mockReturnValue({
      requests: mockRequests,
      stats: mockStats,
      loading: false,
      error: null,
      refreshRequests: vi.fn(),
      refreshStats: vi.fn(),
      getRequest: vi.fn(),
    });

    render(<AnalysisRequests />);

    // Check stats are displayed
    expect(screen.getByText('2')).toBeInTheDocument(); // Total
    expect(screen.getByText('1')).toBeInTheDocument(); // Processing
    expect(screen.getByText('1')).toBeInTheDocument(); // Completed
    expect(screen.getByText('60.0s')).toBeInTheDocument(); // Avg. Time

    // Check requests are displayed
    expect(screen.getByText('req-12345678')).toBeInTheDocument(); // First request ID
    expect(screen.getByText('/test/project1')).toBeInTheDocument(); // First request path
    expect(screen.getByText('req-87654321')).toBeInTheDocument(); // Second request ID
    expect(screen.getByText('/test/project2')).toBeInTheDocument(); // Second request path

    // Check status badges
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByText('processing')).toBeInTheDocument();

    // Check progress for processing request
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  test('should render empty state', () => {
    mockUseAnalysisRequests.mockReturnValue({
      requests: [],
      stats: { ...mockStats, total: 0 },
      loading: false,
      error: null,
      refreshRequests: vi.fn(),
      refreshStats: vi.fn(),
      getRequest: vi.fn(),
    });

    render(<AnalysisRequests />);

    expect(screen.getByText('No analysis requests found')).toBeInTheDocument();
  });
});
