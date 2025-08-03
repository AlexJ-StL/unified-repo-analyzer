import React, { useState, useEffect } from 'react';
import { useAnalysisStore } from '../../store/useAnalysisStore';
import { fileSystemService } from '../../services/fileSystem';
import { isValidFilePath } from '../../utils/validators';
const RepositorySelector = ({ onSelect, className = '' }) => {
    const { setRepositoryPath } = useAnalysisStore();
    const [currentPath, setCurrentPath] = useState('');
    const [directoryItems, setDirectoryItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recentRepositories, setRecentRepositories] = useState([]);
    // Load home directory on component mount
    useEffect(() => {
        const loadHomeDirectory = async () => {
            try {
                const homePath = await fileSystemService.getHomeDirectory();
                setCurrentPath(homePath);
                browseDirectory(homePath);
            }
            catch (error) {
                setError('Failed to load home directory');
                console.error(error);
            }
        };
        const loadRecentRepositories = async () => {
            const recent = await fileSystemService.getRecentRepositories();
            setRecentRepositories(recent);
        };
        loadHomeDirectory();
        loadRecentRepositories();
    }, []);
    const browseDirectory = async (path) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fileSystemService.browseDirectory(path);
            setDirectoryItems(response.items);
            setCurrentPath(response.path);
        }
        catch (error) {
            setError('Failed to browse directory');
            console.error(error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDirectoryClick = (item) => {
        if (item.isDirectory) {
            browseDirectory(item.path);
        }
    };
    const handleParentDirectoryClick = () => {
        // Extract parent directory path
        const pathParts = currentPath.split(/[/\\]/);
        pathParts.pop(); // Remove last part
        const parentPath = pathParts.join('/');
        if (parentPath) {
            browseDirectory(parentPath);
        }
    };
    const handleSelectRepository = () => {
        if (isValidFilePath(currentPath)) {
            setRepositoryPath(currentPath);
            if (onSelect) {
                onSelect(currentPath);
            }
        }
        else {
            setError('Invalid repository path');
        }
    };
    const handlePathChange = (e) => {
        setCurrentPath(e.target.value);
    };
    const handlePathKeyDown = (e) => {
        if (e.key === 'Enter') {
            browseDirectory(currentPath);
        }
    };
    const handleRecentRepositoryClick = (path) => {
        setCurrentPath(path);
        browseDirectory(path);
    };
    return (<div className={`repository-selector ${className}`}>
      <div className="mb-4">
        <label htmlFor="repository-path" className="block text-sm font-medium text-gray-700 mb-1">
          Repository Path
        </label>
        <div className="flex items-center space-x-2">
          <input id="repository-path" type="text" className="flex-1 rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500" placeholder="/path/to/repository" value={currentPath} onChange={handlePathChange} onKeyDown={handlePathKeyDown}/>
          <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" onClick={() => browseDirectory(currentPath)}>
            Browse
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      {recentRepositories.length > 0 && (<div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Recent Repositories</h3>
          <div className="flex flex-wrap gap-2">
            {recentRepositories.map((repo, index) => (<button key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200" onClick={() => handleRecentRepositoryClick(repo)}>
                {repo.split(/[/\\]/).pop()}
              </button>))}
          </div>
        </div>)}

      <div className="border border-gray-200 rounded-md overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
          <button type="button" className="text-sm text-blue-600 hover:text-blue-800 flex items-center" onClick={handleParentDirectoryClick}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Parent Directory
          </button>
          <span className="text-xs text-gray-500 truncate max-w-xs">{currentPath}</span>
        </div>

        <div className="directory-list max-h-60 overflow-y-auto p-2">
          {isLoading ? (<div className="flex justify-center items-center py-4">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>) : directoryItems.length === 0 ? (<div className="text-center py-4 text-gray-500">No items found</div>) : (<ul className="space-y-1">
              {directoryItems.map((item, index) => (<li key={index}>
                  <button type="button" className={`w-full text-left px-2 py-1 rounded-md hover:bg-gray-100 flex items-center ${item.isDirectory ? 'text-blue-600' : 'text-gray-700'}`} onClick={() => handleDirectoryClick(item)}>
                    {item.isDirectory ? (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                      </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>)}
                    <span className="truncate">{item.name}</span>
                  </button>
                </li>))}
            </ul>)}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" onClick={handleSelectRepository}>
          Select Repository
        </button>
      </div>
    </div>);
};
export default RepositorySelector;
//# sourceMappingURL=RepositorySelector.js.map