/**
 * Export service for generating repository analysis exports in various formats
 */
import {
  RepositoryAnalysis,
  BatchAnalysisResult,
  OutputFormat,
} from '@unified-repo-analyzer/shared/src/types/analysis';
/**
 * Service for exporting repository analysis in various formats
 */
export declare class ExportService {
  /**
   * Export repository analysis to the specified format
   *
   * @param analysis - Repository analysis to export
   * @param format - Output format
   * @returns Promise resolving to the exported content
   */
  exportAnalysis(analysis: RepositoryAnalysis, format: OutputFormat): Promise<string>;
  /**
   * Export batch analysis result to the specified format
   *
   * @param batchResult - Batch analysis result to export
   * @param format - Output format
   * @returns Promise resolving to the exported content
   */
  exportBatchAnalysis(batchResult: BatchAnalysisResult, format: OutputFormat): Promise<string>;
  /**
   * Save exported content to a file
   *
   * @param content - Content to save
   * @param outputPath - Path to save the content to
   * @returns Promise resolving to the file path
   */
  saveToFile(content: string, outputPath: string): Promise<string>;
  /**
   * Export repository analysis to JSON format
   *
   * @param analysis - Repository analysis to export
   * @returns JSON string
   */
  private exportToJson;
  /**
   * Export repository analysis to Markdown format
   *
   * @param analysis - Repository analysis to export
   * @returns Markdown string
   */
  private exportToMarkdown;
  /**
   * Export repository analysis to HTML format
   *
   * @param analysis - Repository analysis to export
   * @returns HTML string
   */
  private exportToHtml;
  /**
   * Export batch analysis result to JSON format
   *
   * @param batchResult - Batch analysis result to export
   * @returns JSON string
   */
  private exportBatchToJson;
  /**
   * Export batch analysis result to Markdown format
   *
   * @param batchResult - Batch analysis result to export
   * @returns Markdown string
   */
  private exportBatchToMarkdown;
  /**
   * Export batch analysis result to HTML format
   *
   * @param batchResult - Batch analysis result to export
   * @returns HTML string
   */
  private exportBatchToHtml;
}
declare const _default: ExportService;
export default _default;
