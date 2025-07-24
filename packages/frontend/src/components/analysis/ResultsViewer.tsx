import React, { useState } from 'react';
import { RepositoryAnalysis } from '@unified-repo-analyzer/shared';
import ExecutiveSummary from './results/ExecutiveSummary';
import TechnicalBreakdown from './results/TechnicalBreakdown';
import FileTreeViewer from './results/FileTreeViewer';
import DependencyGraph from './results/DependencyGraph';

interface ResultsViewerProps {
  analysis: RepositoryAnalysis;
}

const ResultsViewer: React.FC<ResultsViewerProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'technical' | 'files' | 'dependencies'>(
    'summary'
  );

  if (!analysis) {
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
  ];

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
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
      </div>

      <div className="p-6">
        {activeTab === 'summary' && <ExecutiveSummary analysis={analysis} />}
        {activeTab === 'technical' && <TechnicalBreakdown analysis={analysis} />}
        {activeTab === 'files' && <FileTreeViewer analysis={analysis} />}
        {activeTab === 'dependencies' && <DependencyGraph analysis={analysis} />}
      </div>
    </div>
  );
};

export default ResultsViewer;
