import type React from 'react';
import type { Repository } from '../../store/useRepositoryStore';

interface RepositoryCardProps {
  repository: Repository;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository,
  isSelected,
  onSelect,
  onView,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    }
    if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    }
    if (sizeInBytes < 1024 * 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div
      className={`border rounded-lg shadow-sm overflow-hidden ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
    >
      <div className="flex items-center p-4">
        <div className="flex-shrink-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{repository.name}</h3>
            <div className="flex space-x-2">
              <button
                onClick={onView}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Details
              </button>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500 truncate">{repository.path}</p>

          {repository.description && (
            <p className="mt-2 text-sm text-gray-700">{repository.description}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {repository.languages.map((language) => (
              <span
                key={language}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {language}
              </span>
            ))}
            {repository.frameworks.map((framework) => (
              <span
                key={framework}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
              >
                {framework}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center text-sm text-gray-500">
            <div className="flex-1">
              <span className="font-medium">Last analyzed:</span>{' '}
              {formatDate(repository.lastAnalyzed)}
            </div>
            <div>
              <span className="font-medium">Size:</span> {formatSize(repository.size)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryCard;
