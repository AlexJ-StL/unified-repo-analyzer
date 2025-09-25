import type { RepositoryAnalysis } from '@unified-repo-analyzer/shared';
import { useId, useState } from 'react';
import ResultsViewer from '../components/analysis/ResultsViewer';
import MainLayout from '../components/layout/MainLayout';
import * as apiService from '../services/api';

const HomePage = () => {
  const [path, setPath] = useState('');
  const [mode, setMode] = useState('basic');
  const [showForm, setShowForm] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RepositoryAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const modeId = useId();
  const pathId = useId();

  const handleStartAnalysis = async () => {
    if (!path.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await apiService.analyzeRepository(path, { mode });
      setAnalysisResult(result);
    } catch (_error) {
      // Handle error
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Welcome to Unified Repository Analyzer
        </h1>
        <p className="text-gray-600 mb-4">
          A comprehensive tool for analyzing code repositories, generating executive summaries, and
          creating technical breakdowns of your projects.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h2 className="text-lg font-medium text-blue-800 mb-2">Analyze Repository</h2>
            <p className="text-sm text-blue-600 mb-3">
              Select a repository to analyze and get detailed insights about its structure and code.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              aria-label="analyze repository"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Analyze
            </button>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h2 className="text-lg font-medium text-green-800 mb-2">Browse Repositories</h2>
            <p className="text-sm text-green-600 mb-3">
              View and search through your previously analyzed repositories.
            </p>
            <a
              href="/repositories"
              className="text-green-700 hover:text-green-900 font-medium text-sm"
            >
              View repositories →
            </a>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h2 className="text-lg font-medium text-purple-800 mb-2">Generate Reports</h2>
            <p className="text-sm text-purple-600 mb-3">
              Create and export reports in various formats (JSON, Markdown, HTML).
            </p>
            <a
              href="/reports"
              className="text-purple-700 hover:text-purple-900 font-medium text-sm"
            >
              Create reports →
            </a>
          </div>
        </div>
        {showForm && (
          <div className="mt-6">
            <div className="mb-4">
              <label htmlFor={modeId} className="block text-sm font-medium text-gray-700">
                Analysis Mode
              </label>
              <select
                id={modeId}
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor={pathId} className="block text-sm font-medium text-gray-700">
                Repository Path
              </label>
              <input
                type="text"
                id={pathId}
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="/path/to/repository"
              />
            </div>
            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                isAnalyzing
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </button>
          </div>
        )}

        {analysisResult && (
          <div className="mt-6">
            <ResultsViewer analysis={analysisResult} />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default HomePage;
