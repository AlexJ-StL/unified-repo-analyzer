import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { type AnalysisOptions, useAnalysisStore } from '../../../store/useAnalysisStore';
import { useSettingsStore } from '../../../store/useSettingsStore';
import AnalysisConfiguration from '../AnalysisConfiguration';

// Mock the Zustand stores
vi.mock('../../../store/useAnalysisStore');
vi.mock('../../../store/useSettingsStore');

describe('AnalysisConfiguration', () => {
  const defaultOptions: AnalysisOptions = {
    mode: 'standard',
    maxFiles: 100,
    maxLinesPerFile: 1000,
    includeLLMAnalysis: true,
    llmProvider: 'claude',
    outputFormats: ['json'],
    includeTree: true,
  };

  const mockSetOptions = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock stores
    vi.mocked(useAnalysisStore).mockReturnValue({
      options: { ...defaultOptions },
      setOptions: mockSetOptions,
    });

    vi.mocked(useSettingsStore).mockReturnValue({
      settings: {
        general: {
          defaultAnalysisMode: 'standard',
          defaultExportFormat: 'json',
          autoIndex: true,
        },
        llmProvider: {
          defaultProvider: 'claude',
          apiKey: '',
          maxTokens: 8000,
          temperature: 0.7,
        },
        fileSystem: {
          ignorePatterns: ['node_modules/', '.git/'],
          cacheDirectory: '~/.repo-analyzer/cache',
          maxFileSize: 1024 * 1024,
        },
      },
    });
  });

  it('renders correctly with default options', () => {
    render(<AnalysisConfiguration />);

    // Check if component renders with correct default values
    expect(screen.getByLabelText(/Analysis Mode/i)).toHaveValue('standard');
    expect(screen.getByLabelText(/LLM Provider/i)).toHaveValue('claude');
    expect(screen.getByLabelText(/Max Files to Process/i)).toHaveValue(100);
    expect(screen.getByLabelText(/Max Lines Per File/i)).toHaveValue(1000);
    expect(screen.getByLabelText(/Include LLM Analysis/i)).toBeChecked();
    expect(screen.getByLabelText(/Include File Tree in Output/i)).toBeChecked();
  });

  it('updates options when analysis mode changes', () => {
    render(<AnalysisConfiguration />);

    // Change analysis mode to quick
    fireEvent.change(screen.getByLabelText(/Analysis Mode/i), { target: { value: 'quick' } });

    // Check if setOptions was called with correct values
    expect(mockSetOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'quick',
        maxFiles: 50,
        maxLinesPerFile: 500,
        includeLLMAnalysis: false,
      })
    );
  });

  it('updates options when LLM provider changes', () => {
    render(<AnalysisConfiguration />);

    // Change LLM provider to gemini
    fireEvent.change(screen.getByLabelText(/LLM Provider/i), { target: { value: 'gemini' } });

    // Check if setOptions was called with correct values
    expect(mockSetOptions).toHaveBeenCalledWith({ llmProvider: 'gemini' });
  });

  it('updates options when checkboxes are toggled', () => {
    render(<AnalysisConfiguration />);

    // Toggle Include LLM Analysis checkbox
    fireEvent.click(screen.getByLabelText(/Include LLM Analysis/i));

    // Check if setOptions was called with correct values
    expect(mockSetOptions).toHaveBeenCalledWith({ includeLLMAnalysis: false });

    // Toggle Include File Tree checkbox
    fireEvent.click(screen.getByLabelText(/Include File Tree in Output/i));

    // Check if setOptions was called with correct values
    expect(mockSetOptions).toHaveBeenCalledWith({ includeTree: false });
  });

  it('updates options when output formats are changed', () => {
    render(<AnalysisConfiguration />);

    // Find and click the HTML checkbox (initially unchecked)
    const htmlCheckbox = screen.getByText(/HTML/i).previousSibling as HTMLInputElement;
    fireEvent.click(htmlCheckbox);

    // Check if setOptions was called with correct values (should add 'html' to outputFormats)
    expect(mockSetOptions).toHaveBeenCalledWith({ outputFormats: ['json', 'html'] });
  });

  it('updates options when number inputs change', () => {
    render(<AnalysisConfiguration />);

    // Change Max Files input
    fireEvent.change(screen.getByLabelText(/Max Files to Process/i), { target: { value: '200' } });

    // Check if setOptions was called with correct values
    expect(mockSetOptions).toHaveBeenCalledWith({ maxFiles: 200 });

    // Change Max Lines input
    fireEvent.change(screen.getByLabelText(/Max Lines Per File/i), { target: { value: '2000' } });

    // Check if setOptions was called with correct values
    expect(mockSetOptions).toHaveBeenCalledWith({ maxLinesPerFile: 2000 });
  });

  it('calls onConfigChange callback when options change', () => {
    const mockOnConfigChange = vi.fn();
    render(<AnalysisConfiguration onConfigChange={mockOnConfigChange} />);

    // Change analysis mode
    fireEvent.change(screen.getByLabelText(/Analysis Mode/i), {
      target: { value: 'comprehensive' },
    });

    // Check if onConfigChange was called
    expect(mockOnConfigChange).toHaveBeenCalled();
  });
});
