import React, { useState, useEffect } from 'react';
import { useRepositoryStore } from '../../store/useRepositoryStore';

const SearchFilters: React.FC = () => {
  const { filters, setFilters, clearFilters, repositories } = useRepositoryStore();

  // Extract unique languages and frameworks from all repositories
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [availableFrameworks, setAvailableFrameworks] = useState<string[]>([]);

  useEffect(() => {
    // Extract unique languages and frameworks
    const languages = new Set<string>();
    const frameworks = new Set<string>();

    repositories.forEach((repo) => {
      repo.languages.forEach((lang) => languages.add(lang));
      repo.frameworks.forEach((framework) => frameworks.add(framework));
    });

    setAvailableLanguages(Array.from(languages).sort());
    setAvailableFrameworks(Array.from(frameworks).sort());
  }, [repositories]);

  const handleLanguageChange = (language: string) => {
    const updatedLanguages = filters.languages.includes(language)
      ? filters.languages.filter((lang) => lang !== language)
      : [...filters.languages, language];

    setFilters({ languages: updatedLanguages });
  };

  const handleFrameworkChange = (framework: string) => {
    const updatedFrameworks = filters.frameworks.includes(framework)
      ? filters.frameworks.filter((fw) => fw !== framework)
      : [...filters.frameworks, framework];

    setFilters({ frameworks: updatedFrameworks });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        {(filters.languages.length > 0 || filters.frameworks.length > 0) && (
          <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800">
            Clear all
          </button>
        )}
      </div>

      {/* Languages filter */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Languages</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {availableLanguages.length === 0 ? (
            <p className="text-sm text-gray-500">No languages available</p>
          ) : (
            availableLanguages.map((language) => (
              <div key={language} className="flex items-center">
                <input
                  id={`language-${language}`}
                  type="checkbox"
                  checked={filters.languages.includes(language)}
                  onChange={() => handleLanguageChange(language)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`language-${language}`} className="ml-2 text-sm text-gray-700">
                  {language}
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Frameworks filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Frameworks</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {availableFrameworks.length === 0 ? (
            <p className="text-sm text-gray-500">No frameworks available</p>
          ) : (
            availableFrameworks.map((framework) => (
              <div key={framework} className="flex items-center">
                <input
                  id={`framework-${framework}`}
                  type="checkbox"
                  checked={filters.frameworks.includes(framework)}
                  onChange={() => handleFrameworkChange(framework)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`framework-${framework}`} className="ml-2 text-sm text-gray-700">
                  {framework}
                </label>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
