/**
 * Configuration import/export component
 */

import React, { useState } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToast } from '../../hooks/useToast';

const ConfigurationImportExport: React.FC = () => {
  const { exportConfiguration, importConfiguration, createBackup } = useSettingsStore();
  const { showToast } = useToast();
  const [importData, setImportData] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const configData = await exportConfiguration();
      const blob = new Blob([configData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repo-analyzer-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Configuration exported successfully', 'success');
    } catch {
      showToast('Failed to export configuration', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      showToast('Please paste configuration data', 'error');
      return;
    }

    setIsImporting(true);
    try {
      await importConfiguration(importData);
      setImportData('');
      showToast('Configuration imported successfully', 'success');
    } catch {
      showToast('Failed to import configuration', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      await createBackup();
      showToast('Backup created successfully', 'success');
    } catch {
      showToast('Failed to create backup', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Import & Export Configuration
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Backup, share, or migrate your configuration settings
        </p>
      </div>

      {/* Export Section */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
          Export Configuration
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Download your current configuration as a JSON file
        </p>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Configuration'}
        </button>
      </div>

      {/* Import Section */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
          Import Configuration
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Paste configuration JSON data to import settings
        </p>
        <textarea
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
          placeholder="Paste configuration JSON here..."
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
        />
        <div className="mt-4 flex space-x-3">
          <button
            onClick={handleImport}
            disabled={isImporting || !importData.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            {isImporting ? 'Importing...' : 'Import Configuration'}
          </button>
          <button
            onClick={() => setImportData('')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Backup Section */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Create Backup</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Create a backup of your current configuration for safekeeping
        </p>
        <button
          onClick={handleCreateBackup}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
        >
          <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
          Create Backup
        </button>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Important Notes
            </h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              <ul className="list-disc list-inside space-y-1">
                <li>Importing configuration will overwrite your current settings</li>
                <li>A backup is automatically created before importing</li>
                <li>API keys and sensitive data are included in exports</li>
                <li>Keep exported files secure and don't share them publicly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationImportExport;
