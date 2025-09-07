import type { RepositoryAnalysis } from '@unified-repo-analyzer/shared';
import type React from 'react';
import ReactMarkdown from 'react-markdown';

interface TechnicalBreakdownProps {
  analysis: RepositoryAnalysis;
}

const TechnicalBreakdown: React.FC<TechnicalBreakdownProps> = ({ analysis }) => {
  const { insights, codeAnalysis, structure } = analysis;

  // Helper function to determine color based on code quality
  const getQualityColor = (quality: string): string => {
    switch (quality) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Technical Breakdown</h2>
        <div className="prose max-w-none">
          <ReactMarkdown>{insights.technicalBreakdown}</ReactMarkdown>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Code Metrics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Functions:</span>
              <span className="font-medium">{codeAnalysis.functionCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Classes:</span>
              <span className="font-medium">{codeAnalysis.classCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Imports:</span>
              <span className="font-medium">{codeAnalysis.importCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cyclomatic Complexity:</span>
              <span className="font-medium">{codeAnalysis.complexity.cyclomaticComplexity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Maintainability Index:</span>
              <span className="font-medium">{codeAnalysis.complexity.maintainabilityIndex}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Technical Debt:</span>
              <span className="font-medium">{codeAnalysis.complexity.technicalDebt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Code Quality:</span>
              <span
                className={`font-medium ${getQualityColor(codeAnalysis.complexity.codeQuality)}`}
              >
                {codeAnalysis.complexity.codeQuality.charAt(0).toUpperCase() +
                  codeAnalysis.complexity.codeQuality.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Architectural Patterns</h3>
          {codeAnalysis.patterns && codeAnalysis.patterns.length > 0 ? (
            <div className="space-y-4">
              {codeAnalysis.patterns.map((pattern, index) => (
                <div
                  key={`pattern-${pattern.name}-${index}`}
                  className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium text-gray-800">{pattern.name}</h4>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {Math.round(pattern.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{pattern.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No architectural patterns detected.</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Files</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  File
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Language
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Lines
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Importance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {structure.keyFiles.slice(0, 10).map((file, index) => (
                <tr key={file.path}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {file.path.split('/').pop()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.language}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.lineCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${file.importance * 100}%` }}
                        />
                      </div>
                      <span className="ml-2">{Math.round(file.importance * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TechnicalBreakdown;
