import {
  ClockIcon,
  DocumentArrowDownIcon,
  FolderOpenIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { OutputFormat } from '@unified-repo-analyzer/shared';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { apiService, handleApiError } from '../../../services/api';

interface ExportHistoryItem {
  id: string;
  format: OutputFormat;
  filename: string;
  timestamp: Date;
  downloadUrl: string;
  size?: number;
  analysisName?: string;
  type: 'single' | 'batch';
}

interface StoredExportHistoryItem {
  id: string;
  format: OutputFormat;
  filename: string;
  timestamp: string;
  downloadUrl: string;
  size?: number;
  analysisName?: string;
  type: 'single' | 'batch';
}

interface ExportHistoryProps {
  className?: string;
}

const ExportHistory: React.FC<ExportHistoryProps> = ({ className = '' }) => {
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Define before useEffect to avoid "used before declaration" and stabilize identity
  const loadExportHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem('exportHistory');
      if (stored) {
        const parsed: StoredExportHistoryItem[] = JSON.parse(stored);
        const historyItems = parsed.map((item) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(historyItems);
      }
    } catch (_error) {
      // no-op
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load export history from localStorage on component mount
  useEffect(() => {
    loadExportHistory();
  }, [loadExportHistory]);

  const saveExportHistory = (newHistory: ExportHistoryItem[]) => {
    try {
      localStorage.setItem('exportHistory', JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (_error) {}
  };

  const handleDownload = async (item: ExportHistoryItem) => {
    try {
      const response = await apiService.downloadExport(item.id);

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Download failed: ${handleApiError(error)}`);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    const newHistory = history.filter((item) => item.id !== itemId);
    saveExportHistory(newHistory);
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;

    const newHistory = history.filter((item) => !selectedItems.has(item.id));
    saveExportHistory(newHistory);
    setSelectedItems(new Set());
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all export history?')) {
      saveExportHistory([]);
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === history.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(history.map((item) => item.id)));
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFormatBadgeColor = (format: OutputFormat) => {
    switch (format) {
      case 'json':
        return 'bg-blue-100 text-blue-800';
      case 'markdown':
        return 'bg-green-100 text-green-800';
      case 'html':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type: 'single' | 'batch') => {
    return type === 'batch' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <FolderOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No export history</h3>
        <p className="mt-1 text-sm text-gray-500">
          Your exported files will appear here for easy re-download.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Export History</h3>
            <span className="ml-2 text-sm text-gray-500">({history.length} items)</span>
          </div>

          <div className="flex space-x-2">
            {selectedItems.size > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete Selected ({selectedItems.size})
              </button>
            )}

            <button
              type="button"
              onClick={handleSelectAll}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {selectedItems.size === history.length ? 'Deselect All' : 'Select All'}
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                selectedItems.has(item.id) ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${item.filename}`}
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{item.filename}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getFormatBadgeColor(item.format)}`}
                      >
                        {item.format.toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeBadgeColor(item.type)}`}
                      >
                        {item.type === 'batch' ? 'Batch' : 'Single'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{item.timestamp.toLocaleString()}</span>
                      {item.size && <span>{formatFileSize(item.size)}</span>}
                      {item.analysisName && <span>Analysis: {item.analysisName}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(item)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                    Download
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="inline-flex items-center p-1 border border-transparent rounded-md text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Export function to add items to history from other components
export const addExportToHistory = (item: Omit<ExportHistoryItem, 'timestamp'>) => {
  try {
    const stored = localStorage.getItem('exportHistory');
    const history = stored ? JSON.parse(stored) : [];

    const newItem = {
      ...item,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [newItem, ...history.slice(0, 49)];
    localStorage.setItem('exportHistory', JSON.stringify(newHistory));
  } catch (_error) {}
};

export default ExportHistory;
