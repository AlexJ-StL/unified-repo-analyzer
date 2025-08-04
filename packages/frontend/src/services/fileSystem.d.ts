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
export declare const fileSystemService: {
    /**
     * Browse a directory and list its contents
     */
    browseDirectory: (path: string) => Promise<BrowseDirectoryResponse>;
    /**
     * Get the user's home directory
     */
    getHomeDirectory: () => Promise<string>;
    /**
     * Validate if a path exists and is a directory
     */
    validateDirectory: (path: string) => Promise<{
        valid: boolean;
        message?: string;
    }>;
    /**
     * Get recent repositories from history
     */
    getRecentRepositories: () => Promise<string[]>;
};
