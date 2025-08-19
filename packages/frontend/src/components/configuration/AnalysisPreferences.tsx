/**
 * Analysis preferences component
 */

import type { AnalysisMode } from '@unified-repo-analyzer/shared';
import type React from 'react';
import { useToast } from '../../hooks/useToast';
import { useSettingsStore } from '../../store/useSettingsStore';

const AnalysisPreferences: React.FC = () => {
  const { preferences, presets, updatePreferenceSection } = useSettingsStore();
  const { showToast } = useToast();

  const handleUpdate = async (updates: any) => {
    try {
      await updatePreferenceSection('analysis', updates);
      showToast({ type: 'success', title: 'Analysis preferences updated' });
    } catch {
      showToast({ type: 'error', title: 'Failed to update preferences' });
    }
  };

  const handleIgnorePatternsChange = (value: string) => {
    const patterns = value.split('\n').filter((p) => p.trim());
    handleUpdate({ ignorePatterns: patterns });
  };

  const applyPreset = (mode: AnalysisMode) => {
    const preset = presets.find((p) => p.name === mode);
    if (preset) {
      handleUpdate({
        defaultMode: preset.name,
        maxFiles: preset.maxFiles,
        maxLinesPerFile: preset.maxLinesPerFile,
        includeLLMAnalysis: preset.includeLLMAnalysis,
        includeTree: preset.includeTree,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Analysis Preferences
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Configure how repositories are analyzed and processed
        </p>
      </div>

      {/* Analysis Mode Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Analysis Mode Presets
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presets.map((preset) => (
            <div
              key={preset.name}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                preferences.analysis.defaultMode === preset.name
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
              onClick={() => applyPreset(preset.name)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{preset.displayName}</h4>
                {preset.recommended && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{preset.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Est. time: {preset.estimatedTime}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Files to Analyze
          </label>
          <input
            type="number"
            value={preferences.analysis.maxFiles}
            onChange={(e) => handleUpdate({ maxFiles: Number.parseInt(e.target.value, 10) })}
            min="1"
            max="10000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Lines per File
          </label>
          <input
            type="number"
            value={preferences.analysis.maxLinesPerFile}
            onChange={(e) => handleUpdate({ maxLinesPerFile: Number.parseInt(e.target.value, 10) })}
            min="100"
            max="50000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max File Size (MB)
          </label>
          <input
            type="number"
            value={Math.round(preferences.analysis.maxFileSize / (1024 * 1024))}
            onChange={(e) =>
              handleUpdate({
                maxFileSize: Number.parseInt(e.target.value, 10) * 1024 * 1024,
              })
            }
            min="1"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cache TTL (hours)
          </label>
          <input
            type="number"
            value={preferences.analysis.cacheTTL}
            onChange={(e) => handleUpdate({ cacheTTL: Number.parseInt(e.target.value, 10) })}
            min="1"
            max="168"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cache Directory
          </label>
          <input
            type="text"
            value={preferences.analysis.cacheDirectory}
            onChange={(e) => handleUpdate({ cacheDirectory: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="include-llm"
            type="checkbox"
            checked={preferences.analysis.includeLLMAnalysis}
            onChange={(e) => handleUpdate({ includeLLMAnalysis: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="include-llm"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Include LLM analysis (generates insights and summaries)
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="include-tree"
            type="checkbox"
            checked={preferences.analysis.includeTree}
            onChange={(e) => handleUpdate({ includeTree: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="include-tree"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Include directory tree in analysis
          </label>
        </div>
      </div>

      {/* Ignore Patterns */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ignore Patterns
        </label>
        <textarea
          value={preferences.analysis.ignorePatterns.join('\n')}
          onChange={(e) => handleIgnorePatternsChange(e.target.value)}
          rows={8}
          placeholder="node_modules/&#10;.git/&#10;*.log&#10;dist/&#10;build/"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          One pattern per line. Supports glob patterns and directory paths.
        </p>
      </div>
    </div>
  );
};

export default AnalysisPreferences;
