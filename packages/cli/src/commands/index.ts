import { ApiClient, ProgressTracker, handleError } from '../utils';

interface IndexCommandOptions {
  rebuild?: boolean;
  update?: boolean;
  path?: string;
}

/**
 * Execute the index command
 */
export async function executeIndex(options: IndexCommandOptions): Promise<void> {
  const progress = new ProgressTracker('Repository Index');
  const apiClient = new ApiClient();

  try {
    if (options.rebuild) {
      // Rebuild the entire index
      progress.start('Rebuilding repository index');

      // Call API to rebuild index
      await apiClient.rebuildIndex();

      progress.succeed('Repository index rebuilt successfully');
    } else if (options.update) {
      // Update the index with new repositories
      progress.start('Updating repository index');

      // Call API to update index
      await apiClient.updateIndex(options.path);

      progress.succeed('Repository index updated successfully');
    } else {
      // Show index status
      progress.start('Fetching index status');

      // Call API to get index status
      const status = await apiClient.getIndexStatus();

      progress.succeed('Index status retrieved');

      // Display index status
      console.log('\nRepository Index Status:');
      console.log(`- Total Repositories: ${status.totalRepositories}`);
      console.log(`- Last Updated: ${new Date(status.lastUpdated).toLocaleString()}`);
      console.log(`- Languages: ${status.languages.join(', ')}`);
      console.log(`- Frameworks: ${status.frameworks.join(', ')}`);
      console.log(`- Tags: ${status.tags.join(', ')}`);
    }
  } catch (error) {
    progress.fail((error as Error).message);
    handleError(error);
  }
}

// Export all commands
export { executeAnalyze } from './analyze';
export { executeBatch } from './batch';
export { executeSearch } from './search';
export { executeExport } from './export';
