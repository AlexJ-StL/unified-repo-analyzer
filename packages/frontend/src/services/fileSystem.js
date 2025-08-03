import api from './api';
export const fileSystemService = {
    /**
     * Browse a directory and list its contents
     */
    browseDirectory: async (path) => {
        const response = await api.get('/filesystem/browse', { params: { path } });
        return response.data;
    },
    /**
     * Get the user's home directory
     */
    getHomeDirectory: async () => {
        const response = await api.get('/filesystem/home');
        return response.data.path;
    },
    /**
     * Validate if a path exists and is a directory
     */
    validateDirectory: async (path) => {
        try {
            const response = await api.get('/filesystem/validate', {
                params: { path, type: 'directory' },
            });
            return response.data;
        }
        catch {
            return { valid: false, message: 'Failed to validate directory' };
        }
    },
    /**
     * Get recent repositories from history
     */
    getRecentRepositories: async () => {
        try {
            const response = await api.get('/filesystem/recent-repositories');
            return response.data.repositories;
        }
        catch (error) {
            console.error('Failed to get recent repositories', error);
            return [];
        }
    },
};
//# sourceMappingURL=fileSystem.js.map