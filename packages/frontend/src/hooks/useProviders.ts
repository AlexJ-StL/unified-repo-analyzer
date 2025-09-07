import { useCallback, useState } from 'react';
import { apiService } from '../services/api';
import { useApi } from './useApi';

export interface Provider {
  id: string;
  name: string;
  displayName: string;
  available: boolean;
  configured: boolean;
  capabilities: string[];
  status: 'active' | 'inactive' | 'error' | 'testing';
  errorMessage?: string;
  model?: string;
}

export interface OpenRouterModel {
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
    instruct_type?: string;
  };
}

interface UseProvidersReturn {
  providers: Provider[];
  loading: boolean;
  error: string | null;
  refreshProviders: () => Promise<void>;
  testProvider: (providerId: string) => Promise<boolean>;
  fetchProviderModels: (providerId: string) => Promise<OpenRouterModel[]>;
  validateProviderModel: (
    providerId: string,
    modelId: string
  ) => Promise<{
    valid: boolean;
    model?: unknown;
    error?: string;
  }>;
  getModelRecommendations: (providerId: string, modelId: string) => Promise<unknown>;
  defaultProvider: string | null;
}

export const useProviders = (): UseProvidersReturn => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [defaultProvider, setDefaultProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    execute: fetchProviders,
    isLoading: isFetching,
    error: fetchError,
  } = useApi(apiService.getProviders, {
    showErrorToast: false,
  });

  const {
    execute: testProviderApi,
    isLoading: isTesting,
    error: testError,
  } = useApi((providerId: unknown) => apiService.testProvider(providerId as string), {
    showErrorToast: false,
  });

  const {
    execute: fetchProviderModelsApi,
    isLoading: isFetchingModels,
    error: fetchModelsError,
  } = useApi((providerId: unknown) => apiService.getProviderModels(providerId as string), {
    showErrorToast: false,
  });

  const {
    execute: validateProviderModelApi,
    isLoading: isValidatingModel,
    error: validateModelError,
  } = useApi((providerId: unknown, modelId: unknown) => apiService.validateProviderModel(providerId as string, modelId as string), {
    showErrorToast: false,
  });

  const {
    execute: getModelRecommendationsApi,
    isLoading: isFetchingRecommendations,
    error: recommendationsError,
  } = useApi((providerId: unknown, modelId: unknown) => apiService.getModelRecommendations(providerId as string, modelId as string), {
    showErrorToast: false,
  });

  const refreshProviders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchProviders();
      if (response) {
        setProviders(response.providers);
        setDefaultProvider(response.defaultProvider);
      }
    } catch (_err) {
      setError(fetchError || 'Failed to fetch providers');
    } finally {
      setLoading(false);
    }
  }, [fetchProviders, fetchError]);

  const testProvider = useCallback(
    async (providerId: string): Promise<boolean> => {
      try {
        const response = await testProviderApi(providerId);
        if (response) {
          // Update the provider status in the local state
          setProviders((prevProviders) =>
            prevProviders.map((provider) =>
              provider.id === providerId
                ? {
                    ...provider,
                    status: response.status,
                    errorMessage: response.errorMessage,
                    lastTested: response.lastTested,
                  }
                : provider
            )
          );
          return response.working;
        }
        return false;
      } catch (_err) {
        setError(testError || `Failed to test provider ${providerId}`);
        return false;
      }
    },
    [testProviderApi, testError]
  );

  const fetchProviderModels = useCallback(
    async (providerId: string): Promise<OpenRouterModel[]> => {
      try {
        const response = await fetchProviderModelsApi(providerId);
        if (response) {
          return response.models as OpenRouterModel[];
        }
        return [];
      } catch (_err) {
        setError(fetchModelsError || `Failed to fetch models for provider ${providerId}`);
        return [];
      }
    },
    [fetchProviderModelsApi, fetchModelsError]
  );

  const validateProviderModel = useCallback(
    async (
      providerId: string,
      modelId: string
    ): Promise<{
      valid: boolean;
      model?: unknown;
      error?: string;
    }> => {
      try {
        const response = await validateProviderModelApi(providerId, modelId);
        if (response) {
          return {
            valid: response.valid,
            model: response.model,
            error: response.error,
          };
        }
        return { valid: false, error: 'No response received' };
      } catch (_err) {
        setError(
          validateModelError || `Failed to validate model ${modelId} for provider ${providerId}`
        );
        return {
          valid: false,
          error: validateModelError || 'Validation failed',
        };
      }
    },
    [validateProviderModelApi, validateModelError]
  );

  const getModelRecommendations = useCallback(
    async (providerId: string, modelId: string): Promise<unknown> => {
      try {
        const response = await getModelRecommendationsApi(providerId, modelId);
        if (response) {
          return response.recommendations;
        }
        return {};
      } catch (_err) {
        setError(recommendationsError || `Failed to get recommendations for model ${modelId}`);
        return {};
      }
    },
    [getModelRecommendationsApi, recommendationsError]
  );

  return {
    providers,
    loading:
      isFetching ||
      isTesting ||
      isFetchingModels ||
      isValidatingModel ||
      isFetchingRecommendations ||
      loading,
    error:
      error ||
      fetchError ||
      testError ||
      fetchModelsError ||
      validateModelError ||
      recommendationsError,
    refreshProviders,
    testProvider,
    fetchProviderModels,
    validateProviderModel,
    getModelRecommendations,
    defaultProvider,
  };
};
