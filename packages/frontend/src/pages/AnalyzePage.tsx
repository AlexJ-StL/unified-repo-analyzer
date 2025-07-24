import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import RepositorySelector from '../components/repository/RepositorySelector';
import AnalysisConfiguration from '../components/analysis/AnalysisConfiguration';
import { ProgressTracker, MobileProgressTracker, ResultsViewer } from '../components/analysis';
import { useAnalysisStore, AnalysisOptions } from '../store/useAnalysisStore';
import { apiService, handleApiError } from '../services/api';
import websocketService from '../services/websocket';

const AnalyzePage = () => {
  const { repositoryPath, options, progress, setProgress, setResults } = useAnalysisStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [analysisId, setAnalysisId] = useState<string | undefined>();

  // Initialize WebSocket connection
  useEffect(() => {
    websocketService.connect();

    return () => {
      if (analysisId) {
        websocketService.unsubscribeFromAnalysis(analysisId);
      }
    };
  }, []);

  const handleStartAnalysis = async () => {
    if (!repositoryPath) {
      setError('Please select a repository path');
      setIsValid(false);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setProgress({
      status: 'running',
      currentStep: 'Initializing analysis',
      progress: 0,
      totalSteps: 100,
      log: 'Starting repository analysis',
    });

    try {
      const response = await apiService.analyzeRepository(repositoryPath, options);
      const newAnalysisId = response.data.analysisId;
      setAnalysisId(newAnalysisId);

      // Subscribe to real-time updates for this analysis
      websocketService.subscribeToAnalysis(newAnalysisId);

      // We don't set completed status here as it will come from the WebSocket
      // The initial results might be partial, full results will come via WebSocket
      if (response.data.results) {
        setResults(response.data.results);
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      setProgress({
        status: 'failed',
        currentStep: 'Analysis failed',
        progress: 0,
        totalSteps: 100,
        error: errorMessage,
        log: `Error: ${errorMessage}`,
      });
      setIsSubmitting(false);
    }
  };

  const handleConfigChange = (updatedOptions: AnalysisOptions) => {
    // This is handled by the store directly, but we can add additional validation here
    setIsValid(true);
    setError(null);
  };

  // Effect to update submission state based on progress status
  useEffect(() => {
    if (progress.status === 'completed' || progress.status === 'failed') {
      setIsSubmitting(false);
    }
  }, [progress.status]);

  return (
    <MainLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Analyze Repository</h1>
        <p className="text-gray-600 mb-6">
          Select a repository to analyze and configure analysis options.
        </p>

        {error && !progress.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Show progress tracker when analysis is running or completed */}
          {(progress.status === 'running' ||
            progress.status === 'completed' ||
            progress.status === 'failed') && (
            <div className="border border-gray-200 rounded-md p-4">
              {/* Desktop version */}
              <div className="hidden md:block">
                <ProgressTracker analysisId={analysisId} />
              </div>
              {/* Mobile version */}
              <div className="block md:hidden">
                <MobileProgressTracker analysisId={analysisId} />
              </div>
            </div>
          )}

          {/* Show results viewer when analysis is completed */}
          {progress.status === 'completed' && useAnalysisStore.getState().results && (
            <div className="mt-6">
              <ResultsViewer analysis={useAnalysisStore.getState().results} />
            </div>
          )}

          {/* Only show repository selection and configuration when not running */}
          {progress.status !== 'running' && (
            <>
              <div className="border border-gray-200 rounded-md p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Repository Selection</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Select a local repository directory to analyze
                </p>
                <RepositorySelector />
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Analysis Options</h2>
                <AnalysisConfiguration onConfigChange={handleConfigChange} />
              </div>
            </>
          )}

          <div className="flex justify-end">
            {progress.status !== 'running' && (
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
                onClick={handleStartAnalysis}
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Start Analysis'
                )}
              </button>
            )}

            {progress.status === 'completed' && (
              <button
                type="button"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => {
                  // Reset for new analysis
                  setProgress({
                    status: 'idle',
                    currentStep: '',
                    progress: 0,
                    totalSteps: 0,
                  });
                  setAnalysisId(undefined);
                }}
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyzePage;
