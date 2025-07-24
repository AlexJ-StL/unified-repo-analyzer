import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import MobileProgressTracker from '../MobileProgressTracker';
import { useAnalysisStore } from '../../../store/useAnalysisStore';
import websocketService from '../../../services/websocket';
import { apiService } from '../../../services/api';

// Mock the dependencies
vi.mock('../../../store/useAnalysisStore');
vi.mock('../../../services/websocket');
vi.mock('../../../services/api');

describe('MobileProgressTracker Component', () => {
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
    render(<MobileProgressTracker />);

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

    render(<MobileProgressTracker />);

    expect(screen.getByText('Processing files')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
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

    render(<MobileProgressTracker />);

    expect(screen.getByText('Analysis completed')).toBeInTheDocument();
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

    render(<MobileProgressTracker />);

    expect(screen.getByText('Analysis failed')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows disconnected state when websocket is not connected', () => {
    vi.mocked(websocketService.isConnected).mockReturnValue(false);

    render(<MobileProgressTracker />);

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('subscribes to analysis updates when analysisId is provided', () => {
    render(<MobileProgressTracker analysisId="test-analysis-123" />);

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

    render(<MobileProgressTracker analysisId="test-analysis-123" />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(apiService.cancelAnalysis).toHaveBeenCalledWith('test-analysis-123');
    });
  });

  it('toggles log visibility when show/hide logs button is clicked', () => {
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

    render(<MobileProgressTracker />);

    // Initially logs should be hidden but the button should be visible
    expect(screen.getByText('Show logs')).toBeInTheDocument();

    // Click to show logs
    fireEvent.click(screen.getByText('Show logs'));

    // Now logs should be visible and button text should change
    expect(screen.getByText('Hide logs')).toBeInTheDocument();
    expect(screen.getByText(/Processing file: main.js/)).toBeInTheDocument();

    // Click to hide logs
    fireEvent.click(screen.getByText('Hide logs'));

    // Logs should be hidden again
    expect(screen.getByText('Show logs')).toBeInTheDocument();
    expect(screen.queryByText(/Processing file: main.js/)).not.toBeInTheDocument();
  });
});
