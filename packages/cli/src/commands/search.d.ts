interface SearchCommandOptions {
    language?: string;
    framework?: string;
    fileType?: string;
    limit?: number;
    sort?: 'relevance' | 'date' | 'size';
    json?: boolean;
}
/**
 * Execute the search command
 */
export declare function executeSearch(query: string, options: SearchCommandOptions): Promise<void>;
export {};
