import chalk from 'chalk';
import { SearchResult } from '@unified-repo-analyzer/shared';
import { ApiClient, ProgressTracker, handleError, formatBytes, formatDate } from '../utils';

interface SearchCommandOptions {
  language?: string;
  framework?: string;
  fileType?: string;
  limit?: number;
  sort?: 'relevance' | 'date' | 'size';
  json?: boolean;
}

/**
 * Execute the search command
 */
export async function executeSearch(query: string, options: SearchCommandOptions): Promise<void> {
  const progress = new ProgressTracker('Repository Search');
  const apiClient = new ApiClient();

  try {
    // Start search
    progress.start(`Searching repositories for "${query}"`);

    // Build search parameters
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);

    if (options.language) searchParams.append('language', options.language);
    if (options.framework) searchParams.append('framework', options.framework);
    if (options.fileType) searchParams.append('fileType', options.fileType);
    if (options.limit) searchParams.append('limit', options.limit.toString());
    if (options.sort) searchParams.append('sort', options.sort);

    // Call API to search repositories
    const results = await apiClient.searchRepositories(searchParams.toString());

    // Complete progress
    progress.succeed(`Found ${results.length} repositories matching "${query}"`);

    // Output results
    if (options.json) {
      // Output as JSON
      console.log(JSON.stringify(results, null, 2));
    } else {
      // Output as formatted text
      if (results.length === 0) {
        console.log(chalk.yellow('\nNo repositories found matching your search criteria.'));
        return;
      }

      console.log('\nSearch Results:');
      results.forEach((result: SearchResult, index: number) => {
        const repo = result.repository;

        console.log(chalk.bold(`\n${index + 1}. ${repo.name} (Score: ${result.score.toFixed(2)})`));
        console.log(chalk.gray(`   Path: ${repo.path}`));
        console.log(chalk.gray(`   Languages: ${repo.languages.join(', ')}`));
        console.log(chalk.gray(`   Size: ${formatBytes(repo.size)}`));
        console.log(chalk.gray(`   Last Analyzed: ${formatDate(repo.lastAnalyzed)}`));

        if (repo.tags.length > 0) {
          console.log(chalk.gray(`   Tags: ${repo.tags.join(', ')}`));
        }

        console.log(`   ${repo.summary}`);

        if (result.matches.length > 0) {
          console.log(chalk.gray('\n   Matches:'));
          result.matches.slice(0, 3).forEach((match) => {
            console.log(
              chalk.gray(`   - ${match.field}: ${match.value} (Score: ${match.score.toFixed(2)})`)
            );
          });

          if (result.matches.length > 3) {
            console.log(chalk.gray(`   ... and ${result.matches.length - 3} more matches`));
          }
        }
      });
    }
  } catch (error) {
    progress.fail((error as Error).message);
    handleError(error);
  }
}
