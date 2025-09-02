/**
 * Tests for LLMProviderPreferences OpenRouter model selection functionality
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useProviders } from '../../../hooks/useProviders';
import { useToast } from '../../../hooks/useToast';
import { useSettingsStore } from '../../../store/useSettingsStore';
import LLMProviderPreferences from '../LLMProviderPreferences';

// Mock the hooks
vi.mock('../../../hooks/useProviders');
vi.mock('../../../store/useSettingsStore');
vi.mock('../../../hooks/useToast');

const mockUseProviders = useProviders as vi.MockedFunction<typeof useProviders>;
const mockUseSettingsStore = useSettingsStore as vi.MockedFunction<typeof useSettingsStore>;
const mockUseToast = useToast as vi.MockedFunction<typeof useToast>;

describe('LLMProviderPreferences OpenRouter Model Selection', () => {
  const mockShowToast = vi.fn();
  const mockUpdatePreferenceSection = vi.fn();
  const mockFetchProviderModels = vi.fn();
  const mockValidateProviderModel = vi.fn();
  const mockGetModelRecommendations = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseToast.mockReturnValue({
      showToast: mockShowToast,
    });

    mockUseSettingsStore.mockReturnValue({
      preferences: {
        llmProvider: {
          defaultProvider: 'openrouter',
          providers: {
            openrouter: {
              name: 'OpenRouter',
              apiKey: 'test-api-key',
              model: '',
              maxTokens: 4000,
              temperature: 0.7,
              enabled: true,
            },
          },
        },
      },
      updatePreferenceSection: mockUpdatePreferenceSection,
    });

    mockUseProviders.mockReturnValue({
      providers: [
        {
          id: 'openrouter',
          name: 'openrouter',
          displayName: 'OpenRouter',
          available: true,
          configured: true,
          capabilities: ['model-selection'],
          status: 'active',
        },
      ],
      loading: false,
      error: null,
      refreshProviders: vi.fn(),
      testProvider: vi.fn(),
      fetchProviderModels: mockFetchProviderModels,
      validateProviderModel: mockValidateProviderModel,
      getModelRecommendations: mockGetModelRecommendations,
      defaultProvider: 'openrouter',
    });
  });

  it('should render OpenRouter with model selection dropdown', () => {
    render(<LLMProviderPreferences />);

    expect(screen.getByText('OpenRouter')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Auto-select model')).toBeInTheDocument();
  });

  it('should fetch models when refresh button is clicked', async () => {
    const mockModels = [
      {
        id: 'openai/gpt-4',
        name: 'GPT-4',
        pricing: { prompt: 0.03, completion: 0.06 },
        context_length: 8192,
      },
      {
        id: 'anthropic/claude-3-haiku',
        name: 'Claude 3 Haiku',
        pricing: { prompt: 0.00025, completion: 0.00125 },
        context_length: 200000,
      },
    ];

    mockFetchProviderModels.mockResolvedValue(mockModels);

    render(<LLMProviderPreferences />);

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockFetchProviderModels).toHaveBeenCalledWith('openrouter');
    });
  });

  it('should validate model when selected', async () => {
    const mockModels = [
      {
        id: 'openai/gpt-4',
        name: 'GPT-4',
        pricing: { prompt: 0.03, completion: 0.06 },
        context_length: 8192,
      },
    ];

    mockFetchProviderModels.mockResolvedValue(mockModels);
    mockValidateProviderModel.mockResolvedValue({
      valid: true,
      model: mockModels[0],
    });

    render(<LLMProviderPreferences />);

    // First fetch models
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockFetchProviderModels).toHaveBeenCalled();
    });

    // Then select a model
    const modelSelect = screen.getByDisplayValue('Auto-select model');
    fireEvent.change(modelSelect, { target: { value: 'openai/gpt-4' } });

    await waitFor(() => {
      expect(mockValidateProviderModel).toHaveBeenCalledWith('openrouter', 'openai/gpt-4');
      expect(mockUpdatePreferenceSection).toHaveBeenCalledWith('llmProvider', {
        providers: {
          openrouter: {
            name: 'OpenRouter',
            apiKey: 'test-api-key',
            model: 'openai/gpt-4',
            maxTokens: 4000,
            temperature: 0.7,
            enabled: true,
          },
        },
      });
    });
  });

  it('should show validation success message', async () => {
    mockValidateProviderModel.mockResolvedValue({
      valid: true,
      model: { id: 'openai/gpt-4', name: 'GPT-4' },
    });

    // Set up initial state with a selected model
    mockUseSettingsStore.mockReturnValue({
      preferences: {
        llmProvider: {
          defaultProvider: 'openrouter',
          providers: {
            openrouter: {
              name: 'OpenRouter',
              apiKey: 'test-api-key',
              model: 'openai/gpt-4',
              maxTokens: 4000,
              temperature: 0.7,
              enabled: true,
            },
          },
        },
      },
      updatePreferenceSection: mockUpdatePreferenceSection,
    });

    render(<LLMProviderPreferences />);

    // Trigger validation by changing model
    const modelSelect = screen.getByDisplayValue('openai/gpt-4');
    fireEvent.change(modelSelect, { target: { value: 'openai/gpt-4' } });

    await waitFor(() => {
      expect(screen.getByText('Model validated successfully')).toBeInTheDocument();
    });
  });

  it('should show validation error message', async () => {
    mockValidateProviderModel.mockResolvedValue({
      valid: false,
      error: 'Model not found',
    });

    // Set up initial state with a selected model
    mockUseSettingsStore.mockReturnValue({
      preferences: {
        llmProvider: {
          defaultProvider: 'openrouter',
          providers: {
            openrouter: {
              name: 'OpenRouter',
              apiKey: 'test-api-key',
              model: 'invalid/model',
              maxTokens: 4000,
              temperature: 0.7,
              enabled: true,
            },
          },
        },
      },
      updatePreferenceSection: mockUpdatePreferenceSection,
    });

    render(<LLMProviderPreferences />);

    // Trigger validation by changing model
    const modelSelect = screen.getByDisplayValue('invalid/model');
    fireEvent.change(modelSelect, { target: { value: 'invalid/model' } });

    await waitFor(() => {
      expect(screen.getByText('Model not found')).toBeInTheDocument();
    });
  });

  it('should display model pricing information', async () => {
    const mockModels = [
      {
        id: 'openai/gpt-4',
        name: 'GPT-4',
        pricing: { prompt: 0.03, completion: 0.06 },
        context_length: 8192,
      },
    ];

    mockFetchProviderModels.mockResolvedValue(mockModels);

    render(<LLMProviderPreferences />);

    // Fetch models
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText(/\$0\.030000\/\$0\.060000 per 1k tokens/)).toBeInTheDocument();
    });
  });

  it('should apply model recommendations when validation succeeds', async () => {
    mockValidateProviderModel.mockResolvedValue({
      valid: true,
      model: { id: 'openai/gpt-4', name: 'GPT-4' },
    });

    mockGetModelRecommendations.mockResolvedValue({
      maxTokens: 8000,
      temperature: 0.8,
    });

    render(<LLMProviderPreferences />);

    // Select a model
    const modelSelect = screen.getByDisplayValue('Auto-select model');
    fireEvent.change(modelSelect, { target: { value: 'openai/gpt-4' } });

    await waitFor(() => {
      expect(mockGetModelRecommendations).toHaveBeenCalledWith('openrouter', 'openai/gpt-4');
      expect(mockUpdatePreferenceSection).toHaveBeenCalledWith('llmProvider', {
        providers: {
          openrouter: {
            name: 'OpenRouter',
            apiKey: 'test-api-key',
            model: 'openai/gpt-4',
            maxTokens: 8000,
            temperature: 0.8,
            enabled: true,
          },
        },
      });
    });
  });
});
