/**
 * LLM Provider preferences component
 */

import { EyeIcon, EyeSlashIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { ProviderConfiguration } from '@unified-repo-analyzer/shared';
import type React from 'react';
import { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useSettingsStore } from '../../store/useSettingsStore';

const LLMProviderPreferences: React.FC = () => {
  const { preferences, updatePreferenceSection } = useSettingsStore();
  const { showToast } = useToast();
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [newProviderName, setNewProviderName] = useState('');

  const handleUpdate = async (updates: any) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          LLM Provider Configuration
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure LLM providers for generating analysis insights and summaries
        </p>
      </div>

      {/* Default Provider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Default Provider
        </label>
        <select
          value={preferences.llmProvider.defaultProvider}
          onChange={(e) => handleUpdate({ defaultProvider: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          {Object.entries(preferences.llmProvider.providers)
            .filter(([, provider]) => provider.enabled)
            .map(([id, provider]) => (
              <option key={id} value={id}>
                {provider.name}
              </option>
            ))}
        </select>
      </div>

      {/* Provider Configurations */}
      <div className="space-y-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white">
          Provider Configurations
        </h4>

        {Object.entries(preferences.llmProvider.providers).map(([providerId, provider]) => (
          <div
            key={providerId}
            className="border border-gray-300 dark:border-gray-600 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                  {provider.name}
                </h5>
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
              {!['claude', 'gemini', 'mock'].includes(providerId) && (
                <button
                  onClick={() => removeProvider(providerId)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  API Key
                </label>
                <div className="relative">
                  <input
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

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={provider.model || ''}
                  onChange={(e) => updateProvider(providerId, { model: e.target.value })}
                  placeholder="Model name (optional)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={provider.maxTokens}
                  onChange={(e) =>
                    updateProvider(providerId, {
                      maxTokens: Number.parseInt(e.target.value),
                    })
                  }
                  min="1000"
                  max="100000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Temperature
                </label>
                <input
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Custom Endpoint (optional)
                </label>
                <input
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
        ))}

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
