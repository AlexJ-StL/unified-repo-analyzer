import { OutputFormat } from '@unified-repo-analyzer/shared';
interface AnalyzeCommandOptions {
  output: OutputFormat;
  mode: 'quick' | 'standard' | 'comprehensive';
  maxFiles?: number;
  maxLines?: number;
  llm?: boolean;
  provider?: string;
  tree?: boolean;
  outputDir?: string;
}
/**
 * Execute the analyze command
 */
export declare function executeAnalyze(
  repoPath: string,
  options: AnalyzeCommandOptions
): Promise<void>;
