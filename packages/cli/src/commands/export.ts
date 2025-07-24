import path from 'path';
import fs from 'fs';
import { OutputFormat } from '@unified-repo-analyzer/shared';
import { ApiClient, ProgressTracker, ensureOutputDirectory, handleError, config } from '../utils';

interface ExportCommandOptions {
  format: OutputFormat;
  outputDir?: string;
  filename?: string;
}

/**
 * Execute the export command
 */
export async function executeExport(
  analysisId: string,
  options: ExportCommandOptions
): Promise<void> {
  const progress = new ProgressTracker('Analysis Export');
  const apiClient = new ApiClient();

  try {
    // Start export
    progress.start(`Exporting analysis ${analysisId} in ${options.format} format`);

    // Call API to export analysis
    const exportData = await apiClient.exportAnalysis(analysisId, options.format);

    // Determine output directory
    const outputDir = options.outputDir || config.get('outputDir');
    const outputDirPath = ensureOutputDirectory(outputDir);

    // Determine output filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFilename =
      options.filename || `analysis-${analysisId}-${timestamp}.${options.format}`;
    const outputPath = path.join(outputDirPath, outputFilename);

    // Write export data to file
    fs.writeFileSync(outputPath, exportData);

    // Complete progress
    progress.succeed(`Export complete. Results saved to ${outputPath}`);
  } catch (error) {
    progress.fail((error as Error).message);
    handleError(error);
  }
}
