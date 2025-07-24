import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { SearchInterface, RepositoryComparison } from '../components/repository';
import { apiService, handleApiError } from '../services/api';

const RepositoriesPage = () => {
  const navigate = useNavigate();
  const [selectedRepositoryIds, setSelectedRepositoryIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const handleViewRepository = (repositoryId: string) => {
    navigate(`/analyze?repositoryId=${repositoryId}`);
  };

  const handleCompareRepositories = (repositoryIds: string[]) => {
    setSelectedRepositoryIds(repositoryIds);
    setShowComparison(true);
  };

  const handleAnalyzeNew = () => {
    navigate('/analyze');
  };

  return (
    <MainLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Repositories</h1>
          <button
            type="button"
            onClick={handleAnalyzeNew}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Analyze New
          </button>
        </div>

        <SearchInterface
          onSelectRepository={handleViewRepository}
          onCompareRepositories={handleCompareRepositories}
        />
      </div>

      {/* Repository comparison modal */}
      {showComparison && (
        <RepositoryComparison
          repositoryIds={selectedRepositoryIds}
          onClose={() => setShowComparison(false)}
        />
      )}
    </MainLayout>
  );
};

export default RepositoriesPage;
