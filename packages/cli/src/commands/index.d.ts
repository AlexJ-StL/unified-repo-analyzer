interface IndexCommandOptions {
  rebuild?: boolean;
  update?: boolean;
  path?: string;
}
/**
 * Execute the index command
 */
export declare function executeIndex(options: IndexCommandOptions): Promise<void>;
export { executeAnalyze } from './analyze';
export { executeBatch } from './batch';
export { executeSearch } from './search';
export { executeExport } from './export';
