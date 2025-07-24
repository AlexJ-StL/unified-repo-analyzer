import React, { useState } from 'react';
import { BatchAnalysisResult } from '@unified-repo-analyzer/shared';
import { PrinterIcon } from '@heroicons/react/24/outline';
import ExportButton from './results/ExportButton';
import PrintableReport from './results/PrintableReport';
import ExportHistory from './results/ExportHistory';

interface BatchResultsViewerProps {
  batchResult: BatchAnalysisResult;
}

const BatchResultsViewer: React.FC<BatchResultsViewerProps> = ({ batchResult }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'repositories' | 'insights' | 'exports'>(
    'overview'
  );
  const [showPrintView, setShowPrintView] = useState(false);

  if (!batchResult) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No batch analysis results available.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'repositories', label: 'Repositories' },
    { id: 'insights', label: 'Combined Insights' },
    { id: 'exports', label: 'Export & Share' },
  ];

  const handlePrint = () => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 100);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  const formatSize = (bytes: number) => {
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  if (showPrintView) {
    return <PrintableReport batchAnalysis={batchResult} />;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm mr-6 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>

            <ExportButton batchAnalysis={batchResult} />
          </div>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Batch Analysis Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {batchResult.repositories.length}
                  </div>
                  <div className="text-sm text-gray-600">Repositories Analyzed</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {batchResult.status?.completed || batchResult.repositories.length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {batchResult.status?.failed || 0}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {(batchResult.processingTime / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-gray-600">Processing Time</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Batch Details</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Batch ID</dt>
                    <dd className="text-sm text-gray-900 font-mono">{batchResult.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900">{formatDate(batchResult.createdAt)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'repositories' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Repository Results</h3>
            <div className="grid gap-6">
              {batchResult.repositories.map((repo, index) => (
                <div key={repo.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">
                        {index + 1}. {repo.name}
                      </h4>
                      <p className="text-sm text-gray-500 mb-3">{repo.path}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm font-medium text-gray-500">Language</div>
                          <div className="text-sm text-gray-900">{repo.language}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Files</div>
                          <div className="text-sm text-gray-900">{repo.fileCount}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Size</div>
                          <div className="text-sm text-gray-900">{formatSize(repo.totalSize)}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500">Quality</div>
                          <div
                            className={`text-sm font-medium ${
                              repo.codeAnalysis.complexity.codeQuality === 'excellent'
                                ? 'text-green-600'
                                : repo.codeAnalysis.complexity.codeQuality === 'good'
                                  ? 'text-blue-600'
                                  : repo.codeAnalysis.complexity.codeQuality === 'fair'
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                            }`}
                          >
                            {repo.codeAnalysis.complexity.codeQuality}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-2">
                          Executive Summary
                        </div>
                        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {repo.insights.executiveSummary}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Combined Insights</h3>

            {batchResult.combinedInsights ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Commonalities</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      {batchResult.combinedInsights.commonalities.map((item, index) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start">
                          <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Key Differences</h4>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      {batchResult.combinedInsights.differences.map((item, index) => (
                        <li key={index} className="text-sm text-yellow-800 flex items-start">
                          <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    Integration Opportunities
                  </h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      {batchResult.combinedInsights.integrationOpportunities.map((item, index) => (
                        <li key={index} className="text-sm text-green-800 flex items-start">
                          <span className="inline-block w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No combined insights available for this batch analysis.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'exports' && <ExportHistory />}
      </div>
    </div>
  );
};

export default BatchResultsViewer;
