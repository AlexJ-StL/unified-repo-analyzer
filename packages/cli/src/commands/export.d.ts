import { OutputFormat } from '@unified-repo-analyzer/shared';
interface ExportCommandOptions {
    format: OutputFormat;
    outputDir?: string;
    filename?: string;
}
/**
 * Execute the export command
 */
export declare function executeExport(analysisId: string, options: ExportCommandOptions): Promise<void>;
export {};
