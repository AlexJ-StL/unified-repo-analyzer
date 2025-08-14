import { useState } from "react";
import PathInput from "../components/common/PathInput";
import MainLayout from "../components/layout/MainLayout";

const SettingsPage = () => {
  const [cacheDirectory, setCacheDirectory] = useState(
    "~/.repo-analyzer/cache"
  );
  const [isCacheDirectoryValid, setIsCacheDirectoryValid] = useState(true);

  return (
    <MainLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>

        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              General Settings
            </h2>
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
                <label
                  htmlFor="auto-index"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Automatically index new repositories
                </label>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              LLM Provider Settings
            </h2>
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
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option>Claude</option>
                  <option>Gemini</option>
                  <option>Mock (Testing)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="api-key"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  API Key
                </label>
                <input
                  type="password"
                  id="api-key"
                  name="api-key"
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
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="8000"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              File System Settings
            </h2>
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
                <p className="mt-1 text-sm text-gray-500">
                  Enter patterns to ignore, one per line
                </p>
              </div>

              <PathInput
                label="Cache Directory"
                value={cacheDirectory}
                onChange={setCacheDirectory}
                onValidationChange={(isValid) =>
                  setIsCacheDirectoryValid(isValid)
                }
                placeholder="~/.repo-analyzer/cache"
                showFormatHints={true}
                validateOnChange={true}
                validateExistence={false}
                validatePermissions={true}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
