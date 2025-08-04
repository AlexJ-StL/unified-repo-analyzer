/**
 * Queue system for managing concurrent tasks
 */
import EventEmitter from 'node:events';
/**
 * Task status enum
 */
export declare enum TaskStatus {
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
export declare enum QueueEvent {
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
export declare class TaskQueue<T, R> extends EventEmitter {
  private tasks;
  private pendingTasks;
  private runningTasks;
  private options;
  private processor;
  private isProcessing;
  /**
   * Creates a new task queue
   *
   * @param processor - Function to process tasks
   * @param options - Queue options
   */
  constructor(processor: (data: T) => Promise<R>, options: QueueOptions);
  /**
   * Adds a task to the queue
   *
   * @param id - Task ID
   * @param data - Task data
   * @returns Task object
   */
  addTask(id: string, data: T): Task<T, R>;
  /**
   * Gets a task by ID
   *
   * @param id - Task ID
   * @returns Task object or undefined if not found
   */
  getTask(id: string): Task<T, R> | undefined;
  /**
   * Gets all tasks
   *
   * @returns Array of all tasks
   */
  getAllTasks(): Task<T, R>[];
  /**
   * Gets queue progress
   *
   * @returns Queue progress object
   */
  getProgress(): QueueProgress;
  /**
   * Processes the queue
   */
  private processQueue;
  /**
   * Processes a single task
   *
   * @param task - Task to process
   */
  private processTask;
  /**
   * Processes a task with timeout
   *
   * @param data - Task data
   * @param timeout - Timeout in milliseconds
   * @returns Task result
   */
  private processWithTimeout;
  /**
   * Emits progress event
   */
  private emitProgress;
}
