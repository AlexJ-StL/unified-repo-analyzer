import type React from 'react';
import { useEffect, useId, useState } from 'react';
import { useRepositoryStore } from '../../store/useRepositoryStore';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    languages: string[];
    frameworks: string[];
  };
  createdAt: string;
}

interface SavedSearchesProps {
  onSelectSearch: (query: string) => void;
}

const SavedSearches: React.FC<SavedSearchesProps> = ({ onSelectSearch }) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');
  const { searchQuery, filters } = useRepositoryStore();
  const id = useId();

  // Load saved searches from localStorage on component mount
  useEffect(() => {
    const loadSavedSearches = () => {
      try {
        const savedSearchesJson = localStorage.getItem('savedSearches');
        if (savedSearchesJson) {
          const parsedSearches = JSON.parse(savedSearchesJson);
          setSavedSearches(parsedSearches);
        }
      } catch (_error) {}
    };

    loadSavedSearches();
  }, []);

  // Save searches to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
  }, [savedSearches]);

  const handleSaveCurrentSearch = () => {
    if (!newSearchName.trim()) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: newSearchName,
      query: searchQuery,
      filters: {
        languages: [...filters.languages],
        frameworks: [...filters.frameworks],
      },
      createdAt: new Date().toISOString(),
    };

    setSavedSearches([...savedSearches, newSearch]);
    setNewSearchName('');
    setIsCreating(false);
  };

  const handleDeleteSearch = (id: string) => {
    setSavedSearches(savedSearches.filter((search) => search.id !== id));
  };

  const handleSelectSearch = (search: SavedSearch) => {
    // Apply the saved search
    onSelectSearch(search.query);

    // We would also apply filters here, but that would require modifying the
    // useRepositoryStore to expose a method to set all filters at once
    // For now, we'll just set the search query
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Saved Searches</h3>
        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isCreating ? 'Cancel' : 'Save current'}
        </button>
      </div>

      {isCreating && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            Search name
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id={id}
              value={newSearchName}
              onChange={(e) => setNewSearchName(e.target.value)}
              placeholder="My search"
              className="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleSaveCurrentSearch}
              disabled={!newSearchName.trim()}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                !newSearchName.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {savedSearches.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">No saved searches yet</p>
        ) : (
          savedSearches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
            >
              <button
                type="button"
                onClick={() => handleSelectSearch(search)}
                className="flex-1 text-left text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                {search.name}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSearch(search.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <title>Delete</title>
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedSearches;
