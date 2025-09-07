import { type AnalysisOptions, type UserPreferences } from '@unified-repo-analyzer/shared';
import Conf from 'conf';
interface CLIConfigSchema {
  apiUrl: string;
  defaultOptions: Partial<AnalysisOptions>;
  outputDir: string;
  userPreferences: UserPreferences;
  profiles?: Record<string, unknown>;
  activeProfile?: string;
}
declare const config: Conf<CLIConfigSchema>;
/**
 * Get effective analysis options from user preferences
 */
export declare function getEffectiveAnalysisOptions(): AnalysisOptions;
/**
 * Update user preferences
 */
export declare function updateUserPreferences(preferences: Partial<UserPreferences>): void;
/**
 * Get user preferences
 */
export declare function getUserPreferences(): UserPreferences;
/**
 * Reset preferences to defaults
 */
export declare function resetPreferences(): void;
export default config;
