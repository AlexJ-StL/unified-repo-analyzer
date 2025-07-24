import api from './api';

export interface DirectoryItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  lastModified?: string;
}

export interface BrowseDirectoryResponse {
  path: string;
  items: DirectoryItem[];
  parent?: string;
}

export const fileSystemService = {
  /**
   * Browse a directory and list its contents
   */
  browseDirectory: async (path: string): Promise<BrowseDirectoryResponse> => {
    const response = await api.get('/filesystem/browse', { params: { path } });
    return response.data;
  },

  /**
   * Get the user's home directory
   */
  getHomeDirectory: async (): Promise<string> => {
    const response = await api.get('/filesystem/home');
    return response.data.path;
  },

  /**
   * Validate if a path exists and is a directory
   */
  validateDirectory: async (path: string): Promise<{ valid: boolean; message?: string }> => {
    try {
      const response = await api.get('/filesystem/validate', {
        params: { path, type: 'directory' },
      });
      return response.data;
    } catch (error) {
      return { valid: false, message: 'Failed to validate directory' };
    }
  },

  /**
   * Get recent repositories from history
   */
  getRecentRepositories: async (): Promise<string[]> => {
    try {
      const response = await api.get('/filesystem/recent-repositories');
      return response.data.repositories;
    } catch (error) {
      console.error('Failed to get recent repositories', error);
      return [];
    }
  },
};
