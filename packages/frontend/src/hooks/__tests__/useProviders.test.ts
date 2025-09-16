import { act, renderHook } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as apiModule from '../../services/api';
import { useProviders } from '../useProviders';
import type { ToastProvider } from '../useToast';

interface Provider {
  id: string;
  name: string;
  displayName: string;
  available: boolean;
  configured: boolean;
  capabilities: string[];
  status: 'active' | 'inactive';
  model: string;
}

interface ProviderModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: number;
    completion: number;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
  };
}

interface GetProvidersResponse {
  providers: Provider[];
  defaultProvider: string | null;
}

interface TestProviderResponse {
  provider: string;
  working: boolean;
  status: 'active' | 'inactive';
  lastTested: string;
}

interface GetProviderModelsResponse {
  provider: string;
  models: ProviderModel[];
}

// Create a wrapper component that includes the ToastProvider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ToastProvider>{ children } < /;;;;;>PTadeioorrstv;
};

// Mock the apiService
const mockGetProviders = vi.fn<[], Promise<GetProvidersResponse>>();
const mockTestProvider = vi.fn<[string], Promise<TestProviderResponse>>();
const mockGetProviderModels = vi.fn<[string], Promise<GetProviderModelsResponse>>();

describe('useProviders', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the apiService methods
    vi.spyOn(apiModule.apiService, 'getProviders').mockImplementation(mockGetProviders);
    vi.spyOn(apiModule.apiService, 'testProvider').mockImplementation(mockTestProvider);
    vi.spyOn(apiModule.apiService, 'getProviderModels').mockImplementation(mockGetProviderModels);
  });

  test('should initialize with empty providers and no loading/error state', () => {
    const { result } = renderHook(() => useProviders(), { wrapper: AllTheProviders });

    expect(result.current.providers).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.defaultProvider).toBeNull();
  });

  test('should fetch providers successfully', async () => {
    const mockProviders = [
      {
        id: 'openrouter',
        name: 'openrouter',
        displayName: 'OpenRouter',
        available: true,
        configured: true,
        capabilities: ['text-generation', 'model-selection'],
        status: 'active',
        model: 'openrouter/auto',
      },
      {
        id: 'claude',
        name: 'claude',
        displayName: 'Anthropic Claude',
        available: true,
        configured: true,
        capabilities: ['text-generation', 'code-analysis'],
        status: 'active',
        model: 'claude-3-haiku-20240307',
      },
    ];

    const mockResponse = {
      providers: mockProviders,
      defaultProvider: 'openrouter',
    };

    mockGetProviders.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useProviders(), { wrapper: AllTheProviders });

    await act(async () => {
      await result.current.refreshProviders();
    });

    expect(result.current.providers).toEqual(mockProviders);
    expect(result.current.defaultProvider).toBe('openrouter');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should handle fetch providers error', async () => {
    mockGetProviders.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProviders(), { wrapper: AllTheProviders });

    await act(async () => {
      await result.current.refreshProviders();
    });

    expect(result.current.providers).toEqual([]);
    expect(result.current.defaultProvider).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch providers');
  });

  test('should test provider successfully', async () => {
    const mockProviders = [
      {
        id: 'openrouter',
        name: 'openrouter',
        displayName: 'OpenRouter',
        available: true,
        configured: true,
        capabilities: ['text-generation', 'model-selection'],
        status: 'inactive',
        model: 'openrouter/auto',
      },
    ];

    const mockResponse = {
      providers: mockProviders,
      defaultProvider: 'openrouter',
    };

    mockGetProviders.mockResolvedValue(mockResponse);

    const mockTestResponse = {
      provider: 'openrouter',
      working: true,
      status: 'active',
      lastTested: new Date().toISOString(),
    };

    mockTestProvider.mockResolvedValue(mockTestResponse);

    const { result } = renderHook(() => useProviders(), { wrapper: AllTheProviders });

    // First fetch providers
    await act(async () => {
      await result.current.refreshProviders();
    });

    // Then test a provider
    let testResult: boolean | undefined;
    await act(async () => {
      testResult = await result.current.testProvider('openrouter');
    });

    expect(testResult).toBe(true);
    // Check that the provider status was updated
    expect(result.current.providers[0].status).toBe('active');
  });

  test('should handle test provider error', async () => {
    const mockProviders = [
      {
        id: 'openrouter',
        name: 'openrouter',
        displayName: 'OpenRouter',
        available: true,
        configured: true,
        capabilities: ['text-generation', 'model-selection'],
        status: 'inactive',
        model: 'openrouter/auto',
      },
    ];

    const mockResponse = {
      providers: mockProviders,
      defaultProvider: 'openrouter',
    };

    mockGetProviders.mockResolvedValue(mockResponse);
    mockTestProvider.mockRejectedValue(new Error('Test failed'));

    const { result } = renderHook(() => useProviders(), { wrapper: AllTheProviders });

    // First fetch providers
    await act(async () => {
      await result.current.refreshProviders();
    });

    // Then test a provider
    let testResult: boolean | undefined;
    await act(async () => {
      testResult = await result.current.testProvider('openrouter');
    });

    expect(testResult).toBe(false);
    expect(result.current.error).toBe('Failed to test provider openrouter');
  });

  test('should fetch provider models successfully', async () => {
    const mockProviders = [
      {
        id: 'openrouter',
        name: 'openrouter',
        displayName: 'OpenRouter',
        available: true,
        configured: true,
        capabilities: ['text-generation', 'model-selection'],
        status: 'active',
        model: 'openrouter/auto',
      },
    ];

    const mockResponse = {
      providers: mockProviders,
      defaultProvider: 'openrouter',
    };

    mockGetProviders.mockResolvedValue(mockResponse);

    const mockModels = [
      {
        id: 'openai/gpt-3.5-turbo',
        name: 'OpenAI GPT-3.5 Turbo',
        description: 'Fast and affordable model',
        pricing: {
          prompt: 0.001,
          completion: 0.002,
        },
        context_length: 4096,
        architecture: {
          modality: 'text',
          tokenizer: 'openai',
        },
      },
    ];

    mockGetProviderModels.mockResolvedValue({
      provider: 'openrouter',
      models: mockModels,
    });

    const { result } = renderHook(() => useProviders(), { wrapper: AllTheProviders });

    // First fetch providers
    await act(async () => {
      await result.current.refreshProviders();
    });

    // Then fetch models
    let models: ProviderModel[] | undefined;
    await act(async () => {
      models = await result.current.fetchProviderModels('openrouter');
    });

    expect(models).toEqual(mockModels);
  });

  test('should handle fetch provider models error', async () => {
    const mockProviders = [
      {
        id: 'openrouter',
        name: 'openrouter',
        displayName: 'OpenRouter',
        available: true,
        configured: true,
        capabilities: ['text-generation', 'model-selection'],
        status: 'active',
        model: 'openrouter/auto',
      },
    ];

    const mockResponse = {
      providers: mockProviders,
      defaultProvider: 'openrouter',
    };

    mockGetProviders.mockResolvedValue(mockResponse);
    mockGetProviderModels.mockRejectedValue(new Error('Models fetch failed'));

    const { result } = renderHook(() => useProviders(), { wrapper: AllTheProviders });

    // First fetch providers
    await act(async () => {
      await result.current.refreshProviders();
    });

    // Then try to fetch models
    let models: ProviderModel[] | undefined;
    await act(async () => {
      models = await result.current.fetchProviderModels('openrouter');
    });

    expect(models).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch models for provider openrouter');
  });
});
