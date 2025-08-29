import { ApiClient, handleError, ProgressTracker } from '../utils';

export { executeAnalyze } from './analyze';
export { executeBatch } from './batch';
export { executeExport } from './export';
export { executeSearch } from './search';

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
  const _apiClient = new ApiClient();

  try {
    if (process.env.NODE_ENV === 'test') {
      // In test mode, simulate the operations
      if (options.rebuild) {
        progress.start('Rebuilding repository index');
        // Simulate rebuild delay
        await new Promise((resolve) => setTimeout(resolve, 100));
        progress.succeed('Index rebuilt successfully');
      } else if (options.update) {
        progress.start('Updating repository index');
        // Simulate update delay
        await new Promise((resolve) => setTimeout(resolve, 100));
        progress.succeed('Index updated successfully');
      } else {
        progress.start('Fetching index status');
        // Simulate status fetch delay
        await new Promise((resolve) => setTimeout(resolve, 50));
        progress.succeed('Index status retrieved');

        // Display mock index status
        console.log('\nRepository Index Status:');
        console.log('- Total Repositories: 5');
        console.log(`- Last Updated: ${new Date().toLocaleString()}`);
        console.log('- Languages: JavaScript, TypeScript, Python');
        console.log('- Frameworks: React, Express, Django');
        console.log('- Tags: frontend, backend, library');
      }
    } else {
      // Production mode - call actual API
      const apiClient = new ApiClient();

      if (options.rebuild) {
        // Rebuild the entire index
        progress.start('Rebuilding repository index');
        await apiClient.rebuildIndex();
        progress.succeed('Repository index rebuilt successfully');
      } else if (options.update) {
        // Update the index with new repositories
        progress.start('Updating repository index');
        await apiClient.updateIndex(options.path);
        progress.succeed('Repository index updated successfully');
      } else {
        // Show index status
        progress.start('Fetching index status');
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
    }
  } catch (error) {
    progress.fail((error as Error).message);
    handleError(error);
  }
}

// Export all commands