/**
 * Progress utility for CLI operations
 */
export declare class ProgressTracker {
    private spinner;
    private startTime;
    private taskName;
    constructor(taskName: string);
    /**
     * Start the progress indicator
     */
    start(message: string): void;
    /**
     * Update the progress indicator
     */
    update(message: string): void;
    /**
     * Update progress with percentage
     */
    updateProgress(current: number, total: number, message?: string): void;
    /**
     * Complete the progress indicator successfully
     */
    succeed(message?: string): void;
    /**
     * Complete the progress indicator with failure
     */
    fail(error: string): void;
    /**
     * Create a visual progress bar
     */
    private createProgressBar;
    /**
     * Format duration in milliseconds to a human-readable string
     */
    private formatDuration;
}
