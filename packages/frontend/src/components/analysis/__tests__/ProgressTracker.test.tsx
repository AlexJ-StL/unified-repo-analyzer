import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiService } from '../../../services/api';
import websocketService from '../../../services/websocket';
import { useAnalysisStore } from '../../../store/useAnalysisStore';
import ProgressTracker from '../ProgressTracker';

// Mock the dependencies
vi.mock('../../../store/useAnalysisStore');
vi.mock('../../../services/websocket');
vi.mock('../../../services/api');

describe('ProgressTracker Component', () => {
  beforeEach(() => {
    // Setup mocks
    vi.mocked(useAnalysisStore).mockReturnValue({
      progress: {
        status: 'idle',
        currentStep: '',
        progress: 0,
        totalSteps: 100,
      },
      setProgress: vi.fn(),
    } as any);

    vi.mocked(websocketService.connect).mockImplementation(() => {});
    vi.mocked(websocketService.isConnected).mockReturnValue(true);
    vi.mocked(websocketService.subscribeToAnalysis).mockImplementation(() => {});
    vi.mocked(websocketService.unsubscribeFromAnalysis).mockImplementation(() => {});

    vi.mocked(apiService.cancelAnalysis).mockResolvedValue({} as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders idle state correctly', () => {
    render(<ProgressTracker />);

    expect(screen.getByText('Analysis Progress')).toBeInTheDocument();
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByText('No analysis in progress')).toBeInTheDocument();
  });

  it('renders running state with progress bar', () => {
    vi.mocked(useAnalysisStore).mockReturnValue({
      progress: {
        status: 'running',
        currentStep: 'Processing files',
        progress: 50,
        totalSteps: 100,
      },
      setProgress: vi.fn(),
    } as any);

    render(<ProgressTracker />);

    expect(screen.getByText('Processing files')).toBeInTheDocument();
    expect(screen.getByText('Step 50 of 100')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders completed state correctly', () => {
    vi.mocked(useAnalysisStore).mockReturnValue({
      progress: {
        status: 'completed',
        currentStep: 'Analysis completed',
        progress: 100,
        totalSteps: 100,
      },
      setProgress: vi.fn(),
    } as any);

    render(<ProgressTracker />);

    expect(screen.getByText('Analysis completed successfully')).toBeInTheDocument();
  });

  it('renders failed state with error message', () => {
    vi.mocked(useAnalysisStore).mockReturnValue({
      progress: {
        status: 'failed',
        currentStep: 'Analysis failed',
        progress: 0,
        totalSteps: 100,
        error: 'Something went wrong',
      },
      setProgress: vi.fn(),
    } as any);

    render(<ProgressTracker />);

    expect(screen.getByText('Analysis failed')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows disconnected state when websocket is not connected', () => {
    vi.mocked(websocketService.isConnected).mockReturnValue(false);

    render(<ProgressTracker />);

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('subscribes to analysis updates when analysisId is provided', () => {
    render(<ProgressTracker analysisId="test-analysis-123" />);

    expect(websocketService.subscribeToAnalysis).toHaveBeenCalledWith('test-analysis-123');
  });

  it('calls cancelAnalysis when cancel button is clicked', async () => {
    vi.mocked(useAnalysisStore).mockReturnValue({
      progress: {
        status: 'running',
        currentStep: 'Processing files',
        progress: 50,
        totalSteps: 100,
      },
      setProgress: vi.fn(),
    } as any);

    render(<ProgressTracker analysisId="test-analysis-123" />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(apiService.cancelAnalysis).toHaveBeenCalledWith('test-analysis-123');
    });
  });

  it('displays logs when available', () => {
    vi.mocked(useAnalysisStore).mockReturnValue({
      progress: {
        status: 'running',
        currentStep: 'Processing files',
        progress: 50,
        totalSteps: 100,
        log: 'Processing file: main.js',
      },
      setProgress: vi.fn(),
    } as any);

    const { rerender } = render(<ProgressTracker />);

    // Initial log should be shown
    expect(screen.getByText(/Processing file: main.js/)).toBeInTheDocument();

    // Update with a new log
    vi.mocked(useAnalysisStore).mockReturnValue({
      progress: {
        status: 'running',
        currentStep: 'Processing files',
        progress: 60,
        totalSteps: 100,
        log: 'Processing file: index.js',
      },
      setProgress: vi.fn(),
    } as any);

    rerender(<ProgressTracker />);

    // Both logs should be visible
    expect(screen.getByText(/Processing file: main.js/)).toBeInTheDocument();
    expect(screen.getByText(/Processing file: index.js/)).toBeInTheDocument();
  });
});
