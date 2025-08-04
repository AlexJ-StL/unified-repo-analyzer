/**
 * UI preferences component
 */

import type React from 'react';
import { useToast } from '../../hooks/useToast';
import { useSettingsStore } from '../../store/useSettingsStore';

const UIPreferences: React.FC = () => {
  const { preferences, updatePreferenceSection } = useSettingsStore();
  const { showToast } = useToast();

  const handleUpdate = async (updates: any) => {
    try {
      await updatePreferenceSection('ui', updates);
      showToast({ type: 'success', title: 'UI preferences updated' });
    } catch {
      showToast({ type: 'error', title: 'Failed to update preferences' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">UI Preferences</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Customize the user interface appearance and behavior
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Default View */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default View
          </label>
          <select
            value={preferences.ui.defaultView}
            onChange={(e) => handleUpdate({ defaultView: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="grid">Grid View</option>
            <option value="list">List View</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Default layout for repository listings
          </p>
        </div>

        {/* Items per Page */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Items per Page
          </label>
          <select
            value={preferences.ui.itemsPerPage}
            onChange={(e) => handleUpdate({ itemsPerPage: Number.parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Number of items to display per page
          </p>
        </div>
      </div>

      {/* UI Options */}
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="compact-mode"
            type="checkbox"
            checked={preferences.ui.compactMode}
            onChange={(e) => handleUpdate({ compactMode: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="compact-mode"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Compact mode (reduced spacing and smaller elements)
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="show-advanced"
            type="checkbox"
            checked={preferences.ui.showAdvancedOptions}
            onChange={(e) => handleUpdate({ showAdvancedOptions: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="show-advanced"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Show advanced options by default
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="enable-animations"
            type="checkbox"
            checked={preferences.ui.enableAnimations}
            onChange={(e) => handleUpdate({ enableAnimations: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="enable-animations"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Enable animations and transitions
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Preview</h4>
        <div className={`space-y-2 ${preferences.ui.compactMode ? 'space-y-1' : 'space-y-2'}`}>
          <div
            className={`bg-gray-100 dark:bg-gray-700 rounded ${preferences.ui.compactMode ? 'p-2' : 'p-3'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h5
                  className={`font-medium text-gray-900 dark:text-white ${preferences.ui.compactMode ? 'text-sm' : 'text-base'}`}
                >
                  Sample Repository
                </h5>
                <p
                  className={`text-gray-600 dark:text-gray-400 ${preferences.ui.compactMode ? 'text-xs' : 'text-sm'}`}
                >
                  JavaScript • React • 1.2MB
                </p>
              </div>
              <div
                className={`text-gray-500 dark:text-gray-400 ${preferences.ui.compactMode ? 'text-xs' : 'text-sm'}`}
              >
                2 hours ago
              </div>
            </div>
          </div>

          {preferences.ui.defaultView === 'grid' ? (
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`bg-gray-100 dark:bg-gray-700 rounded ${preferences.ui.compactMode ? 'p-2' : 'p-3'}`}
              >
                <div
                  className={`font-medium text-gray-900 dark:text-white ${preferences.ui.compactMode ? 'text-sm' : 'text-base'}`}
                >
                  Grid Item 1
                </div>
              </div>
              <div
                className={`bg-gray-100 dark:bg-gray-700 rounded ${preferences.ui.compactMode ? 'p-2' : 'p-3'}`}
              >
                <div
                  className={`font-medium text-gray-900 dark:text-white ${preferences.ui.compactMode ? 'text-sm' : 'text-base'}`}
                >
                  Grid Item 2
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div
                className={`bg-gray-100 dark:bg-gray-700 rounded ${preferences.ui.compactMode ? 'p-2' : 'p-3'}`}
              >
                <div
                  className={`font-medium text-gray-900 dark:text-white ${preferences.ui.compactMode ? 'text-sm' : 'text-base'}`}
                >
                  List Item 1
                </div>
              </div>
              <div
                className={`bg-gray-100 dark:bg-gray-700 rounded ${preferences.ui.compactMode ? 'p-2' : 'p-3'}`}
              >
                <div
                  className={`font-medium text-gray-900 dark:text-white ${preferences.ui.compactMode ? 'text-sm' : 'text-base'}`}
                >
                  List Item 2
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Accessibility */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Accessibility</h4>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              id="high-contrast"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="high-contrast"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              High contrast mode
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="reduce-motion"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="reduce-motion"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Reduce motion (respects system preference)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Font Size
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIPreferences;
