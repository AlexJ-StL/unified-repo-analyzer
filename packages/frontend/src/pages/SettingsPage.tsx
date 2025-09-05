import { useEffect, useState } from 'react';
import PathInput from '../components/common/PathInput';
import MainLayout from '../components/layout/MainLayout';
import { useProviders } from '../hooks/useProviders';
import { useSettingsStore } from '../store/useSettingsStore';
import { useToast } from '../hooks/useToast';

const SettingsPage = () => {
  const { preferences, updatePreferences } = useSettingsStore();
  const { showToast } = useToast();
  const { providers, loading: providersLoading, error: providersError, refreshProviders } = useProviders();
  const [cacheDirectory, setCacheDirectory] = useState('~/.repo-analyzer/cache');
  const [_isCacheDirectoryValid, setIsCacheDirectoryValid] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch providers when component mounts
  useEffect(() => {
    refreshProviders();
  }, [refreshProviders]);

  // Initialize state with current preferences
  const [localPreferences, setLocalPreferences] = useState({
    defaultProvider: preferences.llmProvider.defaultProvider,
    apiKey: '',
    maxTokens: 8000,
  });

  // Update local state when preferences change
  useEffect(() => {
    setLocalPreferences({
      defaultProvider: preferences.llmProvider.defaultProvider,
      apiKey: preferences.llmProvider.providers[preferences.llmProvider.defaultProvider]?.apiKey || '',
      maxTokens: preferences.llmProvider.providers[preferences.llmProvider.defaultProvider]?.maxTokens || 8000,
    });
  }, [preferences]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update LLM provider preferences
      const updatedProviders = {
        ...preferences.llmProvider.providers,
        [localPreferences.defaultProvider]: {
          ...preferences.llmProvider.providers[localPreferences.defaultProvider],
          apiKey: localPreferences.apiKey,
          maxTokens: localPreferences.maxTokens,
        },
      };

      await updatePreferences({
        ...preferences,
        llmProvider: {
          ...preferences.llmProvider,
          defaultProvider: localPreferences.defaultProvider,
          providers: updatedProviders,
        },
      });

      showToast({ type: 'success', title: 'Settings saved successfully' });
    } catch (error) {
      showToast({ type: 'error', title: 'Failed to save settings', message: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      try {
        // This would reset to defaults - for now we'll just show a message
        showToast({ type: 'info', title: 'Reset to defaults functionality not fully implemented' });
      } catch (error) {
        showToast({ type: 'error', title: 'Failed to reset settings', message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  };

  return (
    <MainLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>

        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="default-analysis-mode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Default Analysis Mode
                </label>
                <select
                  id="default-analysis-mode"
                  name="default-analysis-mode"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option>Quick</option>
                  <option>Standard</option>
                  <option>Comprehensive</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="default-export-format"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Default Export Format
                </label>
                <select
                  id="default-export-format"
                  name="default-export-format"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option>JSON</option>
                  <option>Markdown</option>
                  <option>HTML</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  id="auto-index"
                  name="auto-index"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="auto-index" className="ml-2 block text-sm text-gray-900">
                  Automatically index new repositories
                </label>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">LLM Provider Settings</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="default-provider"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Default Provider
                </label>
                <select
                  id="default-provider"
                  name="default-provider"
                  value={localPreferences.defaultProvider}
                  onChange={(e) => setLocalPreferences({...localPreferences, defaultProvider: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.displayName}
                      {!provider.configured && provider.id !== 'mock' && ' (Not configured)'}
                    </option>
                  ))}
                </select>
                {providersError && (
                  <p className="mt-1 text-sm text-red-600">
                    Error loading providers: {providersError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  id="api-key"
                  name="api-key"
                  value={localPreferences.apiKey}
                  onChange={(e) => setLocalPreferences({...localPreferences, apiKey: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your API key"
                />
              </div>

              <div>
                <label
                  htmlFor="max-tokens"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Max Tokens
                </label>
                <input
                  type="number"
                  id="max-tokens"
                  name="max-tokens"
                  value={localPreferences.maxTokens}
                  onChange={(e) => setLocalPreferences({...localPreferences, maxTokens: parseInt(e.target.value) || 0})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="8000"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">File System Settings</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="ignore-patterns"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ignore Patterns
                </label>
                <textarea
                  id="ignore-patterns"
                  name="ignore-patterns"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="node_modules/&#10;.git/&#10;*.log"
                />
                <p className="mt-1 text-sm text-gray-500">Enter patterns to ignore, one per line</p>
              </div>

              <PathInput
                label="Cache Directory"
                value={cacheDirectory}
                onChange={(e) => setCacheDirectory(e.target.value)}
                onValidationChange={(isValid) => setIsCacheDirectoryValid(isValid)}
                showFormatHints={true}
                validateOnChange={true}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSaving
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
