import { PrinterIcon } from '@heroicons/react/24/outline';
import type { RepositoryAnalysis } from '@unified-repo-analyzer/shared';
import type React from 'react';
import { useState } from 'react';
import DependencyGraph from './results/DependencyGraph';
import ExecutiveSummary from './results/ExecutiveSummary';
import ExportButton from './results/ExportButton';
import ExportHistory from './results/ExportHistory';
import FileTreeViewer from './results/FileTreeViewer';
import PrintableReport from './results/PrintableReport';
import TechnicalBreakdown from './results/TechnicalBreakdown';

interface ResultsViewerProps {
  analysis: RepositoryAnalysis | null | undefined;
}

const ResultsViewer: React.FC<ResultsViewerProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<
    'summary' | 'technical' | 'files' | 'dependencies' | 'exports'
  >('summary');
  const [showPrintView, setShowPrintView] = useState(false);

  // Type guard to ensure analysis is valid
  const isValidAnalysis = (
    analysis: RepositoryAnalysis | null | undefined
  ): analysis is RepositoryAnalysis => {
    return (
      analysis !== null &&
      analysis !== undefined &&
      typeof analysis === 'object' &&
      'id' in analysis
    );
  };

  if (!isValidAnalysis(analysis)) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No analysis results available.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: 'Executive Summary' },
    { id: 'technical', label: 'Technical Breakdown' },
    { id: 'files', label: 'File Structure' },
    { id: 'dependencies', label: 'Dependencies' },
    { id: 'exports', label: 'Export & Share' },
  ];

  const handlePrint = () => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 100);
  };

  if (showPrintView) {
    return <PrintableReport analysis={analysis} />;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id as string)}
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
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>

            <ExportButton analysis={analysis} />
          </div>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'summary' && <ExecutiveSummary analysis={analysis} />}
        {activeTab === 'technical' && <TechnicalBreakdown analysis={analysis} />}
        {activeTab === 'files' && <FileTreeViewer analysis={analysis} />}
        {activeTab === 'dependencies' && <DependencyGraph analysis={analysis} />}
        {activeTab === 'exports' && <ExportHistory />}
      </div>
    </div>
  );
};

export default ResultsViewer;
