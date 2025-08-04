import { OutputFormat } from '@unified-repo-analyzer/shared';
interface BatchCommandOptions {
    output: OutputFormat;
    mode: 'quick' | 'standard' | 'comprehensive';
    maxFiles?: number;
    maxLines?: number;
    llm?: boolean;
    provider?: string;
    tree?: boolean;
    outputDir?: string;
    depth?: number;
    filter?: string;
    combined?: boolean;
}
/**
 * Execute the batch command
 */
export declare function executeBatch(basePath: string, options: BatchCommandOptions): Promise<void>;
export {};
