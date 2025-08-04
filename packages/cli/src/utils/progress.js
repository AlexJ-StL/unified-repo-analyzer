"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressTracker = void 0;
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
/**
 * Progress utility for CLI operations
 */
class ProgressTracker {
    spinner;
    startTime;
    taskName;
    constructor(taskName) {
        this.spinner = (0, ora_1.default)();
        this.taskName = taskName;
        this.startTime = 0;
    }
    /**
     * Start the progress indicator
     */
    start(message) {
        this.startTime = Date.now();
        this.spinner.start(`${this.taskName}: ${message}`);
    }
    /**
     * Update the progress indicator
     */
    update(message) {
        this.spinner.text = `${this.taskName}: ${message}`;
    }
    /**
     * Update progress with percentage
     */
    updateProgress(current, total, message) {
        const percent = Math.round((current / total) * 100);
        const progressBar = this.createProgressBar(percent);
        this.spinner.text = `${this.taskName}: ${progressBar} ${percent}% ${message || ''}`;
    }
    /**
     * Complete the progress indicator successfully
     */
    succeed(message) {
        const duration = this.formatDuration(Date.now() - this.startTime);
        this.spinner.succeed(message
            ? `${this.taskName}: ${message} ${chalk_1.default.gray(`(${duration})`)}`
            : `${this.taskName} completed ${chalk_1.default.gray(`(${duration})`)}`);
    }
    /**
     * Complete the progress indicator with failure
     */
    fail(error) {
        const duration = this.formatDuration(Date.now() - this.startTime);
        this.spinner.fail(`${this.taskName} failed: ${error} ${chalk_1.default.gray(`(${duration})`)}`);
    }
    /**
     * Create a visual progress bar
     */
    createProgressBar(percent) {
        const width = 20;
        const completeWidth = Math.round((percent / 100) * width);
        const remainingWidth = width - completeWidth;
        const complete = chalk_1.default.green('█').repeat(completeWidth);
        const remaining = chalk_1.default.gray('░').repeat(remainingWidth);
        return `[${complete}${remaining}]`;
    }
    /**
     * Format duration in milliseconds to a human-readable string
     */
    formatDuration(ms) {
        if (ms < 1000) {
            return `${ms}ms`;
        }
        else if (ms < 60000) {
            return `${(ms / 1000).toFixed(1)}s`;
        }
        else {
            const minutes = Math.floor(ms / 60000);
            const seconds = ((ms % 60000) / 1000).toFixed(0);
            return `${minutes}m ${seconds}s`;
        }
    }
}
exports.ProgressTracker = ProgressTracker;
//# sourceMappingURL=progress.js.map