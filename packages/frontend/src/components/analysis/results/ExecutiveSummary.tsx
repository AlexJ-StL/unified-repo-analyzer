import type { RepositoryAnalysis } from '@unified-repo-analyzer/shared';
import type React from 'react';
import ReactMarkdown from 'react-markdown';

interface ExecutiveSummaryProps {
  analysis: RepositoryAnalysis;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ analysis }) => {
  const { insights, name, language, languages, frameworks, fileCount, directoryCount, totalSize } =
    analysis;

  // Format file size in human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Repository Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Name:</span> {name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Primary Language:</span> {language}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Languages:</span> {languages.join(', ')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Files:</span> {fileCount}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Directories:</span> {directoryCount}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Total Size:</span> {formatFileSize(totalSize)}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Executive Summary</h2>
        <div className="prose max-w-none">
          <ReactMarkdown>{insights.executiveSummary}</ReactMarkdown>
        </div>
      </div>

      {insights.recommendations && insights.recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Recommendations</h3>
          <ul className="list-disc pl-5 space-y-1">
            {insights.recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-700">
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insights.potentialIssues && insights.potentialIssues.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Potential Issues</h3>
          <ul className="list-disc pl-5 space-y-1">
            {insights.potentialIssues.map((issue, index) => (
              <li key={index} className="text-gray-700">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {frameworks && frameworks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Frameworks & Technologies</h3>
          <div className="flex flex-wrap gap-2">
            {frameworks.map((framework, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {framework}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveSummary;
