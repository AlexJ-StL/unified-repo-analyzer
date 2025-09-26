/**
 * LLM Provider preferences component
 */

import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { ProviderConfiguration } from '@unified-repo-analyzer/shared';
import type React from 'react';
import { useEffect, useId, useState } from 'react';
import { useProviders } from '../../hooks/useProviders';
import { useToast } from '../../hooks/useToast';
import { useSettingsStore } from '../../store/useSettingsStore';

interface ProviderModel {
  id: string;
  name: string;
  context_length?: number;
  pricing?: {
    prompt?: number;
    completion?: number;
  };
}

interface ModelRecommendations {
  maxTokens?: number;
  temperature?: number;
}

const LLMProviderPreferences: React.FC = () => {
  const { preferences, updatePreferenceSection, loadPreferences } = useSettingsStore();
  const { showToast } = useToast();
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [newProviderName, setNewProviderName] = useState('');
  const {
    providers: backendProviders,
    loading: providersLoading,
    error: providersError,
    refreshProviders,
    testProvider,
    fetchProviderModels,
    validateProviderModel,
    getModelRecommendations,
  } = useProviders();
  const [testingStatus, setTestingStatus] = useState<
    Record<string, 'idle' | 'testing' | 'success' | 'error'>
  >({});
  const [testingMessages, setTestingMessages] = useState<Record<string, string>>({});
  const [providerModels, setProviderModels] = useState<Record<string, ProviderModel[]>>({});
  const [modelValidation, setModelValidation] = useState<
    Record<
      string,
      {
        valid: boolean;
        error?: string;
        validating: boolean;
      }
    >
  >({});
  const defaultProviderId = useId();

  // Load preferences and fetch backend providers when component mounts
  useEffect(() => {
    loadPreferences();
    refreshProviders();
  }, [loadPreferences, refreshProviders]);

  const handleUpdate = async (updates: Record<string, unknown>) => {
    try {
      await updatePreferenceSection('llmProvider', updates);
      showToast({ type: 'success', title: 'LLM provider preferences updated' });
    } catch {
      showToast({ type: 'error', title: 'Failed to update preferences' });
    }
  };

  const updateProvider = (providerId: string, updates: Partial<ProviderConfiguration>) => {
    const updatedProviders = {
      ...preferences.llmProvider.providers,
      [providerId]: {
        ...preferences.llmProvider.providers[providerId],
        ...updates,
      },
    };
    handleUpdate({ providers: updatedProviders });
  };

  const addProvider = () => {
    if (!newProviderName.trim()) return;

    const newProvider: ProviderConfiguration = {
      name: newProviderName,
      maxTokens: 8000,
      temperature: 0.7,
      enabled: true,
    };

    const updatedProviders = {
      ...preferences.llmProvider.providers,
      [newProviderName.toLowerCase()]: newProvider,
    };

    handleUpdate({ providers: updatedProviders });
    setNewProviderName('');
  };

  const removeProvider = (providerId: string) => {
    const updatedProviders = { ...preferences.llmProvider.providers };
    delete updatedProviders[providerId];
    handleUpdate({ providers: updatedProviders });
  };

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [providerId]: !prev[providerId],
    }));
  };

  const testProviderConnection = async (providerId: string) => {
    setTestingStatus((prev) => ({ ...prev, [providerId]: 'testing' }));
    setTestingMessages((prev) => ({
      ...prev,
      [providerId]: 'Testing connection...',
    }));

    try {
      const result = await testProvider(providerId);
      if (result) {
        setTestingStatus((prev) => ({ ...prev, [providerId]: 'success' }));
        setTestingMessages((prev) => ({
          ...prev,
          [providerId]: 'Connection successful!',
        }));
      } else {
        setTestingStatus((prev) => ({ ...prev, [providerId]: 'error' }));
        setTestingMessages((prev) => ({
          ...prev,
          [providerId]: 'Connection failed. Check your configuration.',
        }));
      }
    } catch (error) {
      setTestingStatus((prev) => ({ ...prev, [providerId]: 'error' }));
      setTestingMessages((prev) => ({
        ...prev,
        [providerId]: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
    }
  };

  const fetchModelsForProvider = async (providerId: string) => {
    if (providerId !== 'openrouter') return;

    try {
      const models = await fetchProviderModels(providerId);
      setProviderModels((prev) => ({ ...prev, [providerId]: models }));
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to fetch models',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const validateModelForProvider = async (providerId: string, modelId: string) => {
    if (!modelId || providerId !== 'openrouter') return;

    const validationKey = `${providerId}-${modelId}`;
    setModelValidation((prev) => ({
      ...prev,
      [validationKey]: { valid: false, validating: true },
    }));

    try {
      const result = await validateProviderModel(providerId, modelId);
      setModelValidation((prev) => ({
        ...prev,
        [validationKey]: {
          valid: result.valid,
          error: result.error,
          validating: false,
        },
      }));

      if (result.valid) {
        // Optionally get and apply model recommendations
        try {
          const recommendations = await getModelRecommendations(providerId, modelId);
          if (
            (recommendations && 'maxTokens' in recommendations) ||
            'temperature' in recommendations
          ) {
            updateProvider(providerId, {
              maxTokens:
                (recommendations as ModelRecommendations).maxTokens ||
                preferences.llmProvider.providers[providerId]?.maxTokens,
              temperature:
                (recommendations as ModelRecommendations).temperature !== undefined
                  ? (recommendations as ModelRecommendations).temperature
                  : preferences.llmProvider.providers[providerId]?.temperature,
            });
          }
        } catch (_recError) {}
      }
    } catch (error) {
      setModelValidation((prev) => ({
        ...prev,
        [validationKey]: {
          valid: false,
          error: error instanceof Error ? error.message : 'Validation failed',
          validating: false,
        },
      }));
    }
  };

  // Get provider status from backend
  const getProviderStatus = (providerId: string) => {
    const backendProvider = backendProviders.find((p) => p.id === providerId);
    return backendProvider ? backendProvider.status : 'inactive';
  };

  // Get provider display name from backend
  const _getProviderDisplayName = (providerId: string) => {
    const backendProvider = backendProviders.find((p) => p.id === providerId);
    return backendProvider ? backendProvider.displayName : providerId;
  };

  // Get provider capabilities from backend
  const getProviderCapabilities = (providerId: string) => {
    const backendProvider = backendProviders.find((p) => p.id === providerId);
    return backendProvider ? backendProvider.capabilities : [];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          LLM Provider Configuration
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure LLM providers for generating analysis insights and summaries
        </p>

        {providersError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-sm text-red-800">
                Error loading provider information: {providersError}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Default Provider */}
      <div>
        <label
          htmlFor={defaultProviderId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Default Provider
        </label>
        <select
          id={defaultProviderId}
          value={preferences.llmProvider.defaultProvider}
          onChange={(e) => handleUpdate({ defaultProvider: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          {Object.entries(preferences.llmProvider.providers)
            .filter(([, provider]) => provider.enabled)
            .map(([id, provider]) => {
              const backendProvider = backendProviders.find((p) => p.id === id);
              return (
                <option key={id} value={id}>
                  {backendProvider ? backendProvider.displayName : provider.name}
                  {!backendProvider?.configured && ' (Not configured)'}
                </option>
              );
            })}
        </select>
      </div>

      {/* Provider Configurations */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white">
          Provider Configurations
        </h4>

        {Object.entries(preferences.llmProvider.providers).map(([providerId, provider]) => {
          const backendProvider = backendProviders.find((p) => p.id === providerId);
          const status = getProviderStatus(providerId);
          const capabilities = getProviderCapabilities(providerId);
          const hasModelSelection = capabilities.includes('model-selection');

          return (
            <div
              key={providerId}
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    {backendProvider ? backendProvider.displayName : provider.name}
                  </h5>

                  {/* Provider Status Indicator */}
                  <div className="flex items-center">
                    {status === 'active' && (
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                    )}
                    {status === 'inactive' && (
                      <ExclamationCircleIcon className="h-4 w-4 text-yellow-500 mr-1" />
                    )}
                    {status === 'error' && <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />}
                    {status === 'testing' && (
                      <ArrowPathIcon className="h-4 w-4 text-blue-500 mr-1 animate-spin" />
                    )}
                    <span
                      className={`text-xs ${
                        status === 'active'
                          ? 'text-green-600'
                          : status === 'inactive'
                            ? 'text-yellow-600'
                            : status === 'error'
                              ? 'text-red-600'
                              : 'text-blue-600'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <input
                      id={`${providerId}-enabled`}
                      type="checkbox"
                      checked={provider.enabled}
                      onChange={(e) =>
                        updateProvider(providerId, {
                          enabled: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`${providerId}-enabled`}
                      className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      Enabled
                    </label>
                  </div>
                </div>
                {/* Only allow removal of custom providers, not built-in ones */}
                {backendProvider && !backendProvider.available && (
                  <button
                    type="button"
                    onClick={() => removeProvider(providerId)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Remove custom provider"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Provider Testing */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => testProviderConnection(providerId)}
                  disabled={testingStatus[providerId] === 'testing' || !provider.apiKey}
                  className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${
                    testingStatus[providerId] === 'testing'
                      ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                      : !provider.apiKey
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {testingStatus[providerId] === 'testing' ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>

                {testingMessages[providerId] && (
                  <div
                    className={`mt-2 text-sm ${
                      testingStatus[providerId] === 'success'
                        ? 'text-green-600'
                        : testingStatus[providerId] === 'error'
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {testingMessages[providerId]}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* API Key */}
                <div>
                  <label
                    htmlFor={`${providerId}-api-key`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      id={`${providerId}-api-key`}
                      type={showApiKeys[providerId] ? 'text' : 'password'}
                      value={provider.apiKey || ''}
                      onChange={(e) => updateProvider(providerId, { apiKey: e.target.value })}
                      placeholder="Enter API key"
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => toggleApiKeyVisibility(providerId)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showApiKeys[providerId] ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Model Selection (OpenRouter specific) */}
                {hasModelSelection && (
                  <div>
                    <label
                      htmlFor={`${providerId}-model`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Model
                    </label>
                    <div className="flex space-x-2">
                      <select
                        id={`${providerId}-model`}
                        value={provider.model || ''}
                        onChange={(e) => {
                          updateProvider(providerId, {
                            model: e.target.value,
                          });
                          // Validate the selected model
                          if (e.target.value) {
                            validateModelForProvider(providerId, e.target.value);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Auto-select model</option>
                        {providerModels[providerId]?.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                            {model.pricing &&
                              ` ($${model.pricing.prompt?.toFixed(6) || 'N/A'}/$${model.pricing.completion?.toFixed(6) || 'N/A'} per 1k tokens)`}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => fetchModelsForProvider(providerId)}
                        disabled={providersLoading}
                        className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                        title="Refresh available models"
                      >
                        <ArrowPathIcon
                          className={`h-4 w-4 ${providersLoading ? 'animate-spin' : ''}`}
                        />
                      </button>
                    </div>

                    {/* Model Validation Status */}
                    {provider.model &&
                      (() => {
                        const validationKey = `${providerId}-${provider.model}`;
                        const validation = modelValidation[validationKey];

                        if (validation?.validating) {
                          return (
                            <div className="mt-1 flex items-center text-sm text-blue-600">
                              <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                              Validating model...
                            </div>
                          );
                        }

                        if (validation?.valid === false) {
                          return (
                            <div className="mt-1 flex items-center text-sm text-red-600">
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              {validation.error || 'Model validation failed'}
                            </div>
                          );
                        }

                        if (validation?.valid === true) {
                          return (
                            <div className="mt-1 flex items-center text-sm text-green-600">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Model validated successfully
                            </div>
                          );
                        }

                        return null;
                      })()}
                    {providerModels[providerId] && providerModels[providerId].length === 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        No models available. Make sure your API key is valid.
                      </p>
                    )}
                    {providerModels[providerId] && providerModels[providerId].length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Available models:</p>
                        <div className="max-h-32 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                              <tr>
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Model
                                </th>
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Context
                                </th>
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Pricing (prompt/completion)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {providerModels[providerId].map((model) => (
                                <tr key={model.id}>
                                  <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                                    {model.name}
                                  </td>
                                  <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                    {model.context_length?.toLocaleString() || 'N/A'}
                                  </td>
                                  <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                    {model.pricing
                                      ? `${model.pricing.prompt?.toFixed(6) || 'N/A'}/${model.pricing.completion?.toFixed(6) || 'N/A'}`
                                      : 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Standard Model Input (for non-OpenRouter providers) */}
                {!hasModelSelection && (
                  <div>
                    <label
                      htmlFor={`${providerId}-model-input`}
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Model
                    </label>
                    <input
                      id={`${providerId}-model-input`}
                      type="text"
                      value={provider.model || ''}
                      onChange={(e) => updateProvider(providerId, { model: e.target.value })}
                      placeholder="Model name (optional)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}

                {/* Max Tokens */}
                <div>
                  <label
                    htmlFor={`${providerId}-max-tokens`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Max Tokens
                  </label>
                  <input
                    id={`${providerId}-max-tokens`}
                    type="number"
                    value={provider.maxTokens}
                    onChange={(e) =>
                      updateProvider(providerId, {
                        maxTokens: Number.parseInt(e.target.value, 10),
                      })
                    }
                    min="1000"
                    max="100000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <label
                    htmlFor={`${providerId}-temperature`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Temperature
                  </label>
                  <input
                    id={`${providerId}-temperature`}
                    type="number"
                    value={provider.temperature}
                    onChange={(e) =>
                      updateProvider(providerId, {
                        temperature: Number.parseFloat(e.target.value),
                      })
                    }
                    min="0"
                    max="1"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Custom Endpoint */}
                <div className="md:col-span-2">
                  <label
                    htmlFor={`${providerId}-endpoint`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Custom Endpoint (optional)
                  </label>
                  <input
                    id={`${providerId}-endpoint`}
                    type="url"
                    value={provider.customEndpoint || ''}
                    onChange={(e) =>
                      updateProvider(providerId, {
                        customEndpoint: e.target.value,
                      })
                    }
                    placeholder="https://api.example.com/v1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Provider */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newProviderName}
              onChange={(e) => setNewProviderName(e.target.value)}
              placeholder="Provider name"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="button"
              onClick={addProvider}
              disabled={!newProviderName.trim()}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Provider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMProviderPreferences;
