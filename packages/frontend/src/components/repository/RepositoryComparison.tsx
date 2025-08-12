import type React from 'react';
import { useEffect, useState } from 'react';
import { apiService, handleApiError } from '../../services/api';

interface Repository {
  id: string;
  name: string;
  path: string;
  languages: string[];
}

interface ComparisonData {
  similarities: {
    languages: string[];
    frameworks: string[];
    dependencies: string[];
  };
  differences: {
    languages: Record<string, string[]>;
    frameworks: Record<string, string[]>;
  };
  integrationPotential: {
    score: number;
    reasons: string[];
    suggestions: string[];
  };
}

interface RepositoryComparisonProps {
  repositoryIds: string[];
  onClose: () => void;
}

const RepositoryComparison: React.FC<RepositoryComparisonProps> = ({ repositoryIds, onClose }) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch repository details
        const repoPromises = repositoryIds.map((id) =>
          apiService.getAnalysis(id).then((response) => response.data)
        );
        const repoResults = await Promise.all(repoPromises);
        setRepositories(repoResults);

        // Fetch comparison data
        const _comparisonResponse = await apiService.searchRepositories('', {
          compareRepositories: repositoryIds,
        });

        // Create mock comparison data since the API doesn't return comparison data yet
        const mockComparison: ComparisonData = {
          similarities: {
            languages: [],
            frameworks: [],
            dependencies: [],
          },
          differences: {
            languages: {},
            frameworks: {},
          },
          integrationPotential: {
            score: 5,
            reasons: ['Analysis in progress'],
            suggestions: ['Comparison feature coming soon'],
          },
        };
        setComparison(mockComparison);
        setIsLoading(false);
      } catch (err) {
        setError(handleApiError(err));
        setIsLoading(false);
      }
    };

    if (repositoryIds.length >= 2) {
      fetchRepositories();
    }
  }, [repositoryIds]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Repository Comparison</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <title>Close dialog</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Repository Comparison</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <title>Close dialog</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Repository headers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-1 md:col-span-3">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Repositories Being Compared</h3>
          </div>
          {repositories.map((repo) => (
            <div key={repo.id} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">{repo.name}</h4>
              <p className="text-sm text-gray-500 mt-1">{repo.path}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {repo.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {comparison && (
          <>
            {/* Similarities */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Similarities</h3>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Common Languages</h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {comparison.similarities.languages.length > 0 ? (
                      comparison.similarities.languages.map((lang) => (
                        <span
                          key={lang}
                          className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                        >
                          {lang}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No common languages found</span>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Common Frameworks</h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {comparison.similarities.frameworks.length > 0 ? (
                      comparison.similarities.frameworks.map((framework) => (
                        <span
                          key={framework}
                          className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800"
                        >
                          {framework}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No common frameworks found</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Common Dependencies</h4>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {comparison.similarities.dependencies.length > 0 ? (
                      comparison.similarities.dependencies.map((dep) => (
                        <span
                          key={dep}
                          className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800"
                        >
                          {dep}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No common dependencies found</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Differences */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Differences</h3>
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {repositories.map((repo) => (
                    <div key={repo.id}>
                      <h4 className="text-sm font-medium text-gray-700">
                        {repo.name} Unique Features
                      </h4>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Unique Languages:</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {comparison.differences.languages[repo.id]?.length > 0 ? (
                            comparison.differences.languages[repo.id].map((lang) => (
                              <span
                                key={lang}
                                className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                              >
                                {lang}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">None</span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mb-1">Unique Frameworks:</p>
                        <div className="flex flex-wrap gap-1">
                          {comparison.differences.frameworks[repo.id]?.length > 0 ? (
                            comparison.differences.frameworks[repo.id].map((framework) => (
                              <span
                                key={framework}
                                className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800"
                              >
                                {framework}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Integration Potential */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Integration Potential</h3>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="mr-4">
                    <div className="text-2xl font-bold text-blue-700">
                      {comparison.integrationPotential.score}/10
                    </div>
                    <div className="text-sm text-gray-500">Compatibility Score</div>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${comparison.integrationPotential.score * 10}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Integration Reasons</h4>
                  <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                    {comparison.integrationPotential.reasons.map((reason, index) => (
                      <li key={`reason-${index}-${reason.slice(0, 20)}`}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Integration Suggestions</h4>
                  <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                    {comparison.integrationPotential.suggestions.map((suggestion, index) => (
                      <li key={`suggestion-${index}-${suggestion.slice(0, 20)}`}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepositoryComparison;
