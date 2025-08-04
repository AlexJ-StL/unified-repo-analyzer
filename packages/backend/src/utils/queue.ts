/**
 * Queue system for managing concurrent tasks
 */

import EventEmitter from 'node:events';

/**
 * Task status enum
 */
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Task interface
 */
export interface Task<T, R> {
  id: string;
  data: T;
  status: TaskStatus;
  result?: R;
  error?: Error;
  startTime?: number;
  endTime?: number;
}

/**
 * Queue options interface
 */
export interface QueueOptions {
  concurrency: number;
  timeout?: number;
}

/**
 * Queue events
 */
export enum QueueEvent {
  TASK_ADDED = 'task:added',
  TASK_STARTED = 'task:started',
  TASK_COMPLETED = 'task:completed',
  TASK_FAILED = 'task:failed',
  QUEUE_DRAINED = 'queue:drained',
  QUEUE_PROGRESS = 'queue:progress',
}

/**
 * Queue progress interface
 */
export interface QueueProgress {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  progress: number;
}

/**
 * Task queue for managing concurrent tasks
 */
export class TaskQueue<T, R> extends EventEmitter {
  private tasks: Map<string, Task<T, R>> = new Map();
  private pendingTasks: string[] = [];
  private runningTasks: Set<string> = new Set();
  private options: QueueOptions;
  private processor: (data: T) => Promise<R>;
  private isProcessing = false;

  /**
   * Creates a new task queue
   *
   * @param processor - Function to process tasks
   * @param options - Queue options
   */
  constructor(processor: (data: T) => Promise<R>, options: QueueOptions) {
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
  public addTask(id: string, data: T): Task<T, R> {
    const task: Task<T, R> = {
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
  public getTask(id: string): Task<T, R> | undefined {
    return this.tasks.get(id);
  }

  /**
   * Gets all tasks
   *
   * @returns Array of all tasks
   */
  public getAllTasks(): Task<T, R>[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Gets queue progress
   *
   * @returns Queue progress object
   */
  public getProgress(): QueueProgress {
    const total = this.tasks.size;
    const pending = this.pendingTasks.length;
    const running = this.runningTasks.size;
    const completed = Array.from(this.tasks.values()).filter(
      (task) => task.status === TaskStatus.COMPLETED
    ).length;
    const failed = Array.from(this.tasks.values()).filter(
      (task) => task.status === TaskStatus.FAILED
    ).length;

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
  private async processQueue(): Promise<void> {
    if (this.pendingTasks.length === 0) {
      if (this.runningTasks.size === 0) {
        this.emit(QueueEvent.QUEUE_DRAINED);
      }
      return;
    }

    this.isProcessing = true;

    // Process tasks up to concurrency limit
    while (this.pendingTasks.length > 0 && this.runningTasks.size < this.options.concurrency) {
      const taskId = this.pendingTasks.shift()!;
      const task = this.tasks.get(taskId)!;

      // Mark task as running
      task.status = TaskStatus.RUNNING;
      task.startTime = Date.now();
      this.runningTasks.add(taskId);

      this.emit(QueueEvent.TASK_STARTED, task);
      this.emitProgress();

      // Process task
      this.processTask(task).catch((_error) => {});
    }
  }

  /**
   * Processes a single task
   *
   * @param task - Task to process
   */
  private async processTask(task: Task<T, R>): Promise<void> {
    try {
      // Process task with timeout if specified
      let result: R;

      if (this.options.timeout && this.options.timeout > 0) {
        result = await this.processWithTimeout(task.data, this.options.timeout);
      } else {
        result = await this.processor(task.data);
      }

      // Mark task as completed
      task.status = TaskStatus.COMPLETED;
      task.result = result;
      task.endTime = Date.now();
      this.runningTasks.delete(task.id);

      this.emit(QueueEvent.TASK_COMPLETED, task);
    } catch (error) {
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
  private async processWithTimeout(data: T, timeout: number): Promise<R> {
    return new Promise<R>((resolve, reject) => {
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
  private emitProgress(): void {
    this.emit(QueueEvent.QUEUE_PROGRESS, this.getProgress());
  }
}
