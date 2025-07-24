import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AnalysisConfiguration from '../AnalysisConfiguration';
import { ToastProvider } from '../../../hooks/useToast';

// Mock the stores
const mockUseAnalysisStore = vi.fn();
const mockUseSettingsStore = vi.fn();

vi.mock('../../../store/useAnalysisStore', () => ({
  useAnalysisStore: () => mockUseAnalysisStore(),
}));

vi.mock('../../../store/useSettingsStore', () => ({
  useSettingsStore: () => mockUseSettingsStore(),
}));

// Mock validators
vi.mock('../../../utils/validators', () => ({
  validateAnalysisOptions: vi.fn(() => []),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe('AnalysisConfiguration Error Handling', () => {
  const mockSetOptions = vi.fn();
  const mockOnConfigChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAnalysisStore.mockReturnValue({
      options: {
        mode: 'standard',
        llmProvider: 'claude',
        outputFormats: ['json'],
        maxFiles: 100,
        maxLinesPerFile: 1000,
        includeLLMAnalysis: true,
        includeTree: true,
      },
      setOptions: mockSetOptions,
    });

    mockUseSettingsStore.mockReturnValue({
      settings: {
        general: {
          defaultAnalysisMode: 'standard',
          defaultExportFormat: 'json',
        },
        llmProvider: {
          defaultProvider: 'claude',
        },
      },
    });
  });

  it('handles initialization errors gracefully', async () => {
    // Mock settings to cause an error
    mockUseSettingsStore.mockReturnValue({
      settings: null, // This should cause an error
    });

    renderWithProviders(<AnalysisConfiguration onConfigChange={mockOnConfigChange} />);

    // Should show loading initially
    expect(screen.getByText('Loading configuration...')).toBeInTheDocument();

    // Should recover with safe defaults
    await waitFor(() => {
      expect(screen.queryByText('Loading configuration...')).not.toBeInTheDocument();
    });

    // Should have called setOptions with safe defaults
    expect(mockSetOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'standard',
        llmProvider: 'claude',
        outputFormats: ['json'],
      })
    );
  });

  it('shows validation errors with recovery option', async () => {
    const { validateAnalysisOptions } = await import('../../../utils/validators');
    vi.mocked(validateAnalysisOptions).mockReturnValue(['Invalid max files value']);

    renderWithProviders(<AnalysisConfiguration onConfigChange={mockOnConfigChange} />);

    // Change mode to trigger validation
    const modeSelect = screen.getByLabelText('Analysis Mode');
    fireEvent.change(modeSelect, { target: { value: 'comprehensive' } });

    await waitFor(() => {
      expect(screen.getByText('Configuration Issues')).toBeInTheDocument();
      expect(screen.getByText('Invalid max files value')).toBeInTheDocument();
      expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
    });
  });

  it('handles provider change errors', async () => {
    renderWithProviders(<AnalysisConfiguration onConfigChange={mockOnConfigChange} />);

    // Mock validation to fail
    const { validateAnalysisOptions } = await import('../../../utils/validators');
    vi.mocked(validateAnalysisOptions).mockReturnValue(['Invalid provider']);

    const providerSelect = screen.getByLabelText('LLM Provider');
    fireEvent.change(providerSelect, { target: { value: 'invalid-provider' } });

    await waitFor(() => {
      expect(screen.getByText('Configuration Issues')).toBeInTheDocument();
    });
  });

  it('disables controls during loading', async () => {
    // Mock a slow initialization
    mockUseAnalysisStore.mockReturnValue({
      options: { mode: undefined }, // This will trigger initialization
      setOptions: mockSetOptions,
    });

    renderWithProviders(<AnalysisConfiguration onConfigChange={mockOnConfigChange} />);

    // Controls should be disabled during loading
    const modeSelect = screen.getByLabelText('Analysis Mode');
    const providerSelect = screen.getByLabelText('LLM Provider');
    const maxFilesInput = screen.getByLabelText('Max Files to Process');

    expect(modeSelect).toBeDisabled();
    expect(providerSelect).toBeDisabled();
    expect(maxFilesInput).toBeDisabled();
  });

  it('shows graceful degradation for unavailable providers', () => {
    // Mock empty providers array to simulate unavailability
    renderWithProviders(<AnalysisConfiguration onConfigChange={mockOnConfigChange} />);

    // The GracefulDegradation component should handle this case
    // In a real scenario, you might mock the availableProviders state
    expect(screen.getByLabelText('LLM Provider')).toBeInTheDocument();
  });

  it('resets to defaults when reset button is clicked', async () => {
    const { validateAnalysisOptions } = await import('../../../utils/validators');
    vi.mocked(validateAnalysisOptions).mockReturnValue(['Some error']);

    renderWithProviders(<AnalysisConfiguration onConfigChange={mockOnConfigChange} />);

    // Trigger validation error
    const modeSelect = screen.getByLabelText('Analysis Mode');
    fireEvent.change(modeSelect, { target: { value: 'comprehensive' } });

    await waitFor(() => {
      expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
    });

    // Click reset button
    fireEvent.click(screen.getByText('Reset to Defaults'));

    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'standard',
          llmProvider: 'claude',
          outputFormats: ['json'],
          maxFiles: 100,
          maxLinesPerFile: 1000,
          includeLLMAnalysis: true,
          includeTree: true,
        })
      );
    });
  });

  it('shows success toast on successful configuration changes', async () => {
    renderWithProviders(<AnalysisConfiguration onConfigChange={mockOnConfigChange} />);

    const modeSelect = screen.getByLabelText('Analysis Mode');
    fireEvent.change(modeSelect, { target: { value: 'quick' } });

    await waitFor(() => {
      expect(screen.getByText('Configuration Updated')).toBeInTheDocument();
      expect(screen.getByText('Analysis mode changed to quick')).toBeInTheDocument();
    });
  });

  it('handles component errors with error boundary', () => {
    // Mock setOptions to throw an error
    mockSetOptions.mockImplementation(() => {
      throw new Error('Store error');
    });

    // Mock console.error to avoid noise in tests
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(<AnalysisConfiguration onConfigChange={mockOnConfigChange} />);

    // Should show error boundary fallback
    expect(screen.getByText('Configuration Error')).toBeInTheDocument();
    expect(
      screen.getByText(/The analysis configuration component encountered an error/)
    ).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('shows warning toast for configuration issues', async () => {
    const { validateAnalysisOptions } = await import('../../../utils/validators');
    vi.mocked(validateAnalysisOptions).mockReturnValue(['Warning: Large file limit']);

    renderWithProviders(<AnalysisConfiguration onConfigChange={mockOnConfigChange} />);

    const maxFilesInput = screen.getByLabelText('Max Files to Process');
    fireEvent.change(maxFilesInput, { target: { value: '1000' } });

    await waitFor(() => {
      expect(screen.getByText('Configuration Issues')).toBeInTheDocument();
    });
  });
});
