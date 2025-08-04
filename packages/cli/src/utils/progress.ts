import chalk from 'chalk';
import ora, { type Ora } from 'ora';

/**
 * Progress utility for CLI operations
 */
export class ProgressTracker {
  private spinner: Ora;
  private startTime: number;
  private taskName: string;

  constructor(taskName: string) {
    this.spinner = ora();
    this.taskName = taskName;
    this.startTime = 0;
  }

  /**
   * Start the progress indicator
   */
  start(message: string): void {
    this.startTime = Date.now();
    this.spinner.start(`${this.taskName}: ${message}`);
  }

  /**
   * Update the progress indicator
   */
  update(message: string): void {
    this.spinner.text = `${this.taskName}: ${message}`;
  }

  /**
   * Update progress with percentage
   */
  updateProgress(current: number, total: number, message?: string): void {
    const percent = Math.round((current / total) * 100);
    const progressBar = this.createProgressBar(percent);

    this.spinner.text = `${this.taskName}: ${progressBar} ${percent}% ${message || ''}`;
  }

  /**
   * Complete the progress indicator successfully
   */
  succeed(message?: string): void {
    const duration = this.formatDuration(Date.now() - this.startTime);
    this.spinner.succeed(
      message
        ? `${this.taskName}: ${message} ${chalk.gray(`(${duration})`)}`
        : `${this.taskName} completed ${chalk.gray(`(${duration})`)}`
    );
  }

  /**
   * Complete the progress indicator with failure
   */
  fail(error: string): void {
    const duration = this.formatDuration(Date.now() - this.startTime);
    this.spinner.fail(`${this.taskName} failed: ${error} ${chalk.gray(`(${duration})`)}`);
  }

  /**
   * Create a visual progress bar
   */
  private createProgressBar(percent: number): string {
    const width = 20;
    const completeWidth = Math.round((percent / 100) * width);
    const remainingWidth = width - completeWidth;

    const complete = chalk.green('█').repeat(completeWidth);
    const remaining = chalk.gray('░').repeat(remainingWidth);

    return `[${complete}${remaining}]`;
  }

  /**
   * Format duration in milliseconds to a human-readable string
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}
