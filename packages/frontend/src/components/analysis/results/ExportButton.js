import React, { useState } from 'react';
import { ChevronDownIcon, DocumentArrowDownIcon, ShareIcon } from '@heroicons/react/24/outline';
import { apiService, handleApiError } from '../../../services/api';
const ExportButton = ({ analysis, batchAnalysis, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(null);
    const [exportHistory, setExportHistory] = useState([]);
    const formats = [
        { value: 'json', label: 'JSON', description: 'Structured data for programmatic use' },
        { value: 'markdown', label: 'Markdown', description: 'Human-readable documentation' },
        { value: 'html', label: 'HTML', description: 'Formatted report with styling' },
    ];
    const handleExport = async (format, download = false) => {
        if (!analysis && !batchAnalysis)
            return;
        setIsExporting(format);
        try {
            let response;
            if (analysis) {
                response = await apiService.exportAnalysis(analysis, format, download);
            }
            else if (batchAnalysis) {
                response = await apiService.exportBatchAnalysis(batchAnalysis, format, download);
            }
            if (download && response) {
                // Handle direct download
                const blob = new Blob([response.data]);
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const name = analysis?.name || 'batch_analysis';
                link.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis.${getFileExtension(format)}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
            else if (response?.data) {
                // Add to export history
                const exportInfo = {
                    id: response.data.exportId,
                    format,
                    filename: response.data.filename,
                    timestamp: new Date(),
                    downloadUrl: response.data.downloadUrl,
                };
                setExportHistory((prev) => [exportInfo, ...prev.slice(0, 9)]); // Keep last 10 exports
            }
        }
        catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${handleApiError(error)}`);
        }
        finally {
            setIsExporting(null);
            setIsOpen(false);
        }
    };
    const handleDownloadFromHistory = async (exportInfo) => {
        try {
            const response = await apiService.downloadExport(exportInfo.id);
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = exportInfo.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('Download failed:', error);
            alert(`Download failed: ${handleApiError(error)}`);
        }
    };
    const handleShare = async (format) => {
        try {
            const response = analysis
                ? await apiService.exportAnalysis(analysis, format, false)
                : await apiService.exportBatchAnalysis(batchAnalysis, format, false);
            if (response?.data?.downloadUrl) {
                const shareUrl = `${window.location.origin}${response.data.downloadUrl}`;
                if (navigator.share) {
                    await navigator.share({
                        title: `Repository Analysis - ${analysis?.name || 'Batch Analysis'}`,
                        text: 'Check out this repository analysis',
                        url: shareUrl,
                    });
                }
                else {
                    // Fallback: copy to clipboard
                    await navigator.clipboard.writeText(shareUrl);
                    alert('Share link copied to clipboard!');
                }
            }
        }
        catch (error) {
            console.error('Share failed:', error);
            alert(`Share failed: ${handleApiError(error)}`);
        }
    };
    const getFileExtension = (format) => {
        switch (format) {
            case 'json':
                return 'json';
            case 'markdown':
                return 'md';
            case 'html':
                return 'html';
            default:
                return 'txt';
        }
    };
    return (<div className={`relative inline-block text-left ${className}`}>
      <div>
        <button type="button" className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" onClick={() => setIsOpen(!isOpen)} disabled={isExporting !== null}>
          {isExporting ? (<>
              <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              Exporting {isExporting.toUpperCase()}...
            </>) : (<>
              <DocumentArrowDownIcon className="-ml-1 mr-2 h-4 w-4"/>
              Export
              <ChevronDownIcon className="-mr-1 ml-2 h-4 w-4"/>
            </>)}
        </button>
      </div>

      {isOpen && (<div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-200">
              Export Options
            </div>

            {formats.map((format) => (<div key={format.value} className="px-4 py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{format.label}</div>
                    <div className="text-xs text-gray-500">{format.description}</div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button onClick={() => handleExport(format.value, true)} className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" disabled={isExporting !== null}>
                      <DocumentArrowDownIcon className="h-3 w-3 mr-1"/>
                      Download
                    </button>
                    <button onClick={() => handleShare(format.value)} className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" disabled={isExporting !== null}>
                      <ShareIcon className="h-3 w-3 mr-1"/>
                      Share
                    </button>
                  </div>
                </div>
              </div>))}

            {exportHistory.length > 0 && (<>
                <div className="px-4 py-2 text-sm font-medium text-gray-900 border-t border-gray-200 bg-gray-50">
                  Recent Exports
                </div>
                <div className="max-h-32 overflow-y-auto">
                  {exportHistory.slice(0, 5).map((exportInfo) => (<div key={exportInfo.id} className="px-4 py-2 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-gray-900">{exportInfo.filename}</div>
                          <div className="text-xs text-gray-500">
                            {exportInfo.timestamp.toLocaleString()}
                          </div>
                        </div>
                        <button onClick={() => handleDownloadFromHistory(exportInfo)} className="text-xs text-blue-600 hover:text-blue-800">
                          Download
                        </button>
                      </div>
                    </div>))}
                </div>
              </>)}
          </div>
        </div>)}
    </div>);
};
export default ExportButton;
//# sourceMappingURL=ExportButton.js.map