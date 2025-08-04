/**
 * Code structure analysis utilities
 */
import { FunctionInfo, ClassInfo } from '@unified-repo-analyzer/shared/src/types/repository';
/**
 * Result of code structure analysis
 */
export interface CodeStructureAnalysis {
  /**
   * Detected functions
   */
  functions: FunctionInfo[];
  /**
   * Detected classes
   */
  classes: ClassInfo[];
  /**
   * Number of import statements
   */
  importCount: number;
}
/**
 * Analyzes code structure to detect functions, classes, and imports
 *
 * @param content - File content
 * @param language - Programming language
 * @returns Code structure analysis
 */
export declare function analyzeCodeStructure(
  content: string,
  language: string
): CodeStructureAnalysis;
