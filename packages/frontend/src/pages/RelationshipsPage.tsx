import type {
  GraphEdge,
  GraphNode,
  IntegrationOpportunity,
  RelationshipGraph,
  RelationshipInsights,
} from '@unified-repo-analyzer/shared/src/types/analysis';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import IntegrationOpportunities from '../components/repository/IntegrationOpportunities';
import RelationshipGraphComponent from '../components/repository/RelationshipGraph';
import RelationshipInsightsComponent from '../components/repository/RelationshipInsights';
import api, { handleApiError } from '../services/api';

const RelationshipsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'graph' | 'insights' | 'opportunities'>('graph');
  const [selectedRepositories, setSelectedRepositories] = useState<string[]>([]);
  const [relationshipGraph, setRelationshipGraph] = useState<RelationshipGraph | null>(null);
  const [relationshipInsights, setRelationshipInsights] = useState<RelationshipInsights | null>(
    null
  );
  const [integrationOpportunities, setIntegrationOpportunities] = useState<
    IntegrationOpportunity[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected repositories from URL params
  useEffect(() => {
    const repoIds = searchParams.get('repositories');
    if (repoIds) {
      setSelectedRepositories(repoIds.split(','));
    }
  }, [searchParams]);

  // Define before useEffect to avoid \"used before declaration\" and stabilize identity
  const loadRelationshipData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all data in parallel
      const [graphResponse, insightsResponse, opportunitiesResponse] = await Promise.all([
        api.get('/api/repositories/relationships/graph', {
          params: { repositoryIds: selectedRepositories },
        }),
        api.get('/api/repositories/relationships/insights', {
          params: { repositoryIds: selectedRepositories },
        }),
        api.post('/api/repositories/relationships/opportunities', {
          repositoryIds: selectedRepositories,
        }),
      ]);

      setRelationshipGraph(graphResponse.data);
      setRelationshipInsights(insightsResponse.data);
      setIntegrationOpportunities(opportunitiesResponse.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [selectedRepositories]);

  // Load data when repositories change
  useEffect(() => {
    if (selectedRepositories.length > 0) {
      loadRelationshipData();
    }
  }, [selectedRepositories, loadRelationshipData]);

  const handleRepositorySelection = (repoIds: string[]) => {
    setSelectedRepositories(repoIds);

    // Update URL params
    if (repoIds.length > 0) {
      setSearchParams({ repositories: repoIds.join(',') });
    } else {
      setSearchParams({});
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    console.log('Node clicked:', node);
    // Could open repository details or add to selection
  };

  const handleEdgeClick = (edge: GraphEdge) => {
    console.log('Edge clicked:', edge);
    // Could show relationship details
  };

  const handleSelectOpportunity = (opportunity: IntegrationOpportunity) => {
    console.log('Opportunity selected:', opportunity);
    // Could navigate to implementation guide or show detailed modal
  };

  if (selectedRepositories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Repositories Selected</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select repositories from the repositories page to analyze their relationships and
              integration opportunities.
            </p>
            <div className="mt-6">
              <a
                href="/repositories"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Repositories
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Repository Relationships</h1>
          <p className="mt-2 text-gray-600">
            Analyze relationships, discover integration opportunities, and visualize connections
            between your repositories.
          </p>

          {/* Selected Repositories */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Selected repositories:</span>
            {selectedRepositories.map((repoId) => (
              <span
                key={repoId}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {repoId}
                <button
                  onClick={() =>
                    handleRepositorySelection(selectedRepositories.filter((id) => id !== repoId))
                  }
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-600"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('graph')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'graph'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Relationship Graph
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'insights'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Insights & Analytics
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'opportunities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Integration Opportunities
            </button>
          </nav>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            <span className="ml-3 text-gray-600">Analyzing relationships...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium">Error loading relationship data</h3>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={loadRelationshipData}
                  className="text-sm underline mt-2 hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {!isLoading && !error && (
          <>
            {activeTab === 'graph' && relationshipGraph && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Repository Relationship Graph
                </h2>
                <p className="text-gray-600 mb-6">
                  Interactive visualization showing relationships between repositories. Click and
                  drag nodes to explore connections.
                </p>
                <RelationshipGraphComponent
                  data={relationshipGraph}
                  width={800}
                  height={600}
                  onNodeClick={handleNodeClick}
                  onEdgeClick={handleEdgeClick}
                />
              </div>
            )}

            {activeTab === 'insights' && relationshipInsights && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Relationship Insights & Analytics
                </h2>
                <p className="text-gray-600 mb-6">
                  Statistical analysis and insights about repository relationships, technologies,
                  and patterns.
                </p>
                <RelationshipInsightsComponent insights={relationshipInsights} />
              </div>
            )}

            {activeTab === 'opportunities' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Integration Opportunities
                </h2>
                <p className="text-gray-600 mb-6">
                  Discover potential ways to integrate your repositories into larger systems and
                  applications.
                </p>
                <IntegrationOpportunities
                  opportunities={integrationOpportunities}
                  onSelectOpportunity={handleSelectOpportunity}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RelationshipsPage;
