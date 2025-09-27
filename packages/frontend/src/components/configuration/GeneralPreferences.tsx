/**
 * General preferences component
 */

import type React from 'react';
import { useId } from 'react';
import { useToast } from '../../hooks/useToast';
import { useSettingsStore } from '../../store/useSettingsStore';

const GeneralPreferences: React.FC = () => {
  const { preferences, updatePreferenceSection } = useSettingsStore();
  const { showToast } = useToast();
  const baseId = useId();

  const handleUpdate = async (updates: Record<string, unknown>) => {
    try {
      await updatePreferenceSection('general', updates);
      showToast({ type: 'success', title: 'General preferences updated' });
    } catch {
      showToast({ type: 'error', title: 'Failed to update preferences' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          General Preferences
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure general application settings and behavior
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Default Workspace */}
        <div>
          <label
            htmlFor={`${baseId}-default-workspace`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Default Workspace
          </label>
          <input
            id={`${baseId}-default-workspace`}
            type="text"
            value={preferences.general.defaultWorkspace || ''}
            onChange={(e) => handleUpdate({ defaultWorkspace: e.target.value })}
            placeholder="Path to default workspace"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Default directory to open when starting the application
          </p>
        </div>

        {/* Theme */}
        <div>
          <label
            htmlFor={`${baseId}-theme`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Theme
          </label>
          <select
            id={`${baseId}-theme`}
            value={preferences.general.theme}
            onChange={(e) => handleUpdate({ theme: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label
            htmlFor={`${baseId}-language`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Language
          </label>
          <select
            id={`${baseId}-language`}
            value={preferences.general.language}
            onChange={(e) => handleUpdate({ language: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
          </select>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id={`${baseId}-auto-save`}
            type="checkbox"
            checked={preferences.general.autoSave}
            onChange={(e) => handleUpdate({ autoSave: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor={`${baseId}-auto-save`}
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Auto-save preferences
          </label>
        </div>

        <div className="flex items-center">
          <input
            id={`${baseId}-auto-index`}
            type="checkbox"
            checked={preferences.general.autoIndex}
            onChange={(e) => handleUpdate({ autoIndex: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor={`${baseId}-auto-index`}
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Automatically index analyzed repositories
          </label>
        </div>

        <div className="flex items-center">
          <input
            id={`${baseId}-notifications`}
            type="checkbox"
            checked={preferences.general.enableNotifications}
            onChange={(e) => handleUpdate({ enableNotifications: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor={`${baseId}-notifications`}
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Enable notifications
          </label>
        </div>
      </div>
    </div>
  );
};

export default GeneralPreferences;
