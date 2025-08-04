/**
 * Queue system for managing concurrent tasks
 */
import EventEmitter from 'events';
/**
 * Task status enum
 */
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["RUNNING"] = "running";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["FAILED"] = "failed";
})(TaskStatus || (TaskStatus = {}));
/**
 * Queue events
 */
export var QueueEvent;
(function (QueueEvent) {
    QueueEvent["TASK_ADDED"] = "task:added";
    QueueEvent["TASK_STARTED"] = "task:started";
    QueueEvent["TASK_COMPLETED"] = "task:completed";
    QueueEvent["TASK_FAILED"] = "task:failed";
    QueueEvent["QUEUE_DRAINED"] = "queue:drained";
    QueueEvent["QUEUE_PROGRESS"] = "queue:progress";
})(QueueEvent || (QueueEvent = {}));
/**
 * Task queue for managing concurrent tasks
 */
export class TaskQueue extends EventEmitter {
    tasks = new Map();
    pendingTasks = [];
    runningTasks = new Set();
    options;
    processor;
    isProcessing = false;
    /**
     * Creates a new task queue
     *
     * @param processor - Function to process tasks
     * @param options - Queue options
     */
    constructor(processor, options) {
        super();
        this.processor = processor;
        this.options = {
            concurrency: 1,
            timeout: 0,
            ...options,
        };
    }
    /**
     * Adds a task to the queue
     *
     * @param id - Task ID
     * @param data - Task data
     * @returns Task object
     */
    addTask(id, data) {
        const task = {
            id,
            data,
            status: TaskStatus.PENDING,
        };
        this.tasks.set(id, task);
        this.pendingTasks.push(id);
        this.emit(QueueEvent.TASK_ADDED, task);
        this.emitProgress();
        // Start processing if not already
        if (!this.isProcessing) {
            this.processQueue();
        }
        return task;
    }
    /**
     * Gets a task by ID
     *
     * @param id - Task ID
     * @returns Task object or undefined if not found
     */
    getTask(id) {
        return this.tasks.get(id);
    }
    /**
     * Gets all tasks
     *
     * @returns Array of all tasks
     */
    getAllTasks() {
        return Array.from(this.tasks.values());
    }
    /**
     * Gets queue progress
     *
     * @returns Queue progress object
     */
    getProgress() {
        const total = this.tasks.size;
        const pending = this.pendingTasks.length;
        const running = this.runningTasks.size;
        const completed = Array.from(this.tasks.values()).filter((task) => task.status === TaskStatus.COMPLETED).length;
        const failed = Array.from(this.tasks.values()).filter((task) => task.status === TaskStatus.FAILED).length;
        return {
            total,
            pending,
            running,
            completed,
            failed,
            progress: total > 0 ? Math.round(((completed + failed) / total) * 100) : 0,
        };
    }
    /**
     * Processes the queue
     */
    async processQueue() {
        if (this.pendingTasks.length === 0) {
            if (this.runningTasks.size === 0) {
                this.emit(QueueEvent.QUEUE_DRAINED);
            }
            return;
        }
        this.isProcessing = true;
        // Process tasks up to concurrency limit
        while (this.pendingTasks.length > 0 && this.runningTasks.size < this.options.concurrency) {
            const taskId = this.pendingTasks.shift();
            const task = this.tasks.get(taskId);
            // Mark task as running
            task.status = TaskStatus.RUNNING;
            task.startTime = Date.now();
            this.runningTasks.add(taskId);
            this.emit(QueueEvent.TASK_STARTED, task);
            this.emitProgress();
            // Process task
            this.processTask(task).catch((error) => {
                console.error(`Error processing task ${taskId}:`, error);
            });
        }
    }
    /**
     * Processes a single task
     *
     * @param task - Task to process
     */
    async processTask(task) {
        try {
            // Process task with timeout if specified
            let result;
            if (this.options.timeout && this.options.timeout > 0) {
                result = await this.processWithTimeout(task.data, this.options.timeout);
            }
            else {
                result = await this.processor(task.data);
            }
            // Mark task as completed
            task.status = TaskStatus.COMPLETED;
            task.result = result;
            task.endTime = Date.now();
            this.runningTasks.delete(task.id);
            this.emit(QueueEvent.TASK_COMPLETED, task);
        }
        catch (error) {
            // Mark task as failed
            task.status = TaskStatus.FAILED;
            task.error = error instanceof Error ? error : new Error(String(error));
            task.endTime = Date.now();
            this.runningTasks.delete(task.id);
            this.emit(QueueEvent.TASK_FAILED, task);
        }
        this.emitProgress();
        // Continue processing queue
        setImmediate(() => this.processQueue());
    }
    /**
     * Processes a task with timeout
     *
     * @param data - Task data
     * @param timeout - Timeout in milliseconds
     * @returns Task result
     */
    async processWithTimeout(data, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Task timed out after ${timeout}ms`));
            }, timeout);
            this.processor(data)
                .then((result) => {
                clearTimeout(timer);
                resolve(result);
            })
                .catch((error) => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }
    /**
     * Emits progress event
     */
    emitProgress() {
        this.emit(QueueEvent.QUEUE_PROGRESS, this.getProgress());
    }
}
//# sourceMappingURL=queue.js.map