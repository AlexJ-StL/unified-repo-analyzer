import React, { useState, useEffect } from 'react';
import { useRepositoryStore } from '../../store/useRepositoryStore';
import { apiService, handleApiError } from '../../services/api';
import SearchFilters from './SearchFilters';
import RepositoryCard from './RepositoryCard';
import Pagination from './Pagination';
import SavedSearches from './SavedSearches';

interface SearchInterfaceProps {
  onSelectRepository?: (repositoryId: string) => void;
  onCompareRepositories?: (repositoryIds: string[]) => void;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onSelectRepository,
  onCompareRepositories,
}) => {
  const {
    repositories,
    isLoading,
    error,
    searchQuery,
    filters,
    setRepositories,
    setLoading,
    setError,
    setSearchQuery,
  } = useRepositoryStore();

  const [selectedRepositories, setSelectedRepositories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<string>('lastAnalyzed');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  // Fetch repositories based on search query, filters, sorting and pagination
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        setLoading(true);
        const response = await apiService.searchRepositories(searchQuery, {
          ...filters,
          page: currentPage,
          limit: itemsPerPage,
          sortBy: sortField,
          sortDirection,
        });

        setRepositories(response.data.repositories);
        setTotalPages(Math.ceil(response.data.total / itemsPerPage));
        setLoading(false);
      } catch (err) {
        setError(handleApiError(err));
        setLoading(false);
      }
    };

    fetchRepositories();
  }, [searchQuery, filters, currentPage, sortField, sortDirection]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new sort field
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleRepositorySelect = (id: string) => {
    if (selectedRepositories.includes(id)) {
      setSelectedRepositories(selectedRepositories.filter((repoId) => repoId !== id));
    } else {
      setSelectedRepositories([...selectedRepositories, id]);
    }
  };

  const handleCompare = () => {
    if (selectedRepositories.length >= 2 && onCompareRepositories) {
      onCompareRepositories(selectedRepositories);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search repositories..."
            className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
        <button
          disabled={selectedRepositories.length < 2}
          onClick={handleCompare}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            selectedRepositories.length < 2
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Compare Selected ({selectedRepositories.length})
        </button>
      </div>

      {/* Saved searches and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/4">
          <SavedSearches onSelectSearch={handleSearch} />
          <div className="mt-4">
            <SearchFilters />
          </div>
        </div>

        <div className="md:w-3/4">
          {/* Sort options */}
          <div className="flex justify-end mb-4">
            <label className="text-sm text-gray-600 mr-2 self-center">Sort by:</label>
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value)}
              className="rounded-md border border-gray-300 shadow-sm px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Name</option>
              <option value="lastAnalyzed">Last Analyzed</option>
              <option value="size">Size</option>
              <option value="complexity">Complexity</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="ml-2 p-1 rounded-md hover:bg-gray-100"
            >
              {sortDirection === 'asc' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Repository cards */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          ) : repositories.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded-md text-center">
              No repositories found matching your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {repositories.map((repository) => (
                <RepositoryCard
                  key={repository.id}
                  repository={repository}
                  isSelected={selectedRepositories.includes(repository.id)}
                  onSelect={() => handleRepositorySelect(repository.id)}
                  onView={() => onSelectRepository && onSelectRepository(repository.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;
