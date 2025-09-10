/**
 * Tests for the queue system
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { QueueEvent, TaskQueue, TaskStatus } from '../queue.js';

describe('TaskQueue', () => {
  // Mock processor function
  const mockProcessor = vi.fn().mockImplementation(async (data: number) => {
    return data * 2;
  });

  // Reset mock before each test
  beforeEach(() => {
    mockProcessor.mockClear();
  });

  test('should process tasks sequentially with concurrency 1', async () => {
    // Create queue with concurrency 1
    const queue = new TaskQueue(mockProcessor, { concurrency: 1 });

    // Add tasks
    queue.addTask('task1', 1);
    queue.addTask('task2', 2);
    queue.addTask('task3', 3);

    // Wait for queue to drain
    await new Promise<void>((resolve) => {
      queue.on(QueueEvent.QUEUE_DRAINED, resolve);
    });

    // Check that all tasks were processed
    expect(mockProcessor).toHaveBeenCalledTimes(3);
    expect(mockProcessor).toHaveBeenCalledWith(1);
    expect(mockProcessor).toHaveBeenCalledWith(2);
    expect(mockProcessor).toHaveBeenCalledWith(3);

    // Check task results
    const task1 = queue.getTask('task1');
    const task2 = queue.getTask('task2');
    const task3 = queue.getTask('task3');

    expect(task1?.status).toBe(TaskStatus.COMPLETED);
    expect(task1?.result).toBe(2);

    expect(task2?.status).toBe(TaskStatus.COMPLETED);
    expect(task2?.result).toBe(4);

    expect(task3?.status).toBe(TaskStatus.COMPLETED);
    expect(task3?.result).toBe(6);
  });

  test('should process tasks concurrently with concurrency > 1', async () => {
    // Create queue with concurrency 2
    const queue = new TaskQueue(mockProcessor, { concurrency: 2 });

    // Add tasks
    queue.addTask('task1', 1);
    queue.addTask('task2', 2);
    queue.addTask('task3', 3);

    // Wait for queue to drain
    await new Promise<void>((resolve) => {
      queue.on(QueueEvent.QUEUE_DRAINED, resolve);
    });

    // Check that all tasks were processed
    expect(mockProcessor).toHaveBeenCalledTimes(3);

    // Check task results
    const task1 = queue.getTask('task1');
    const task2 = queue.getTask('task2');
    const task3 = queue.getTask('task3');

    expect(task1?.status).toBe(TaskStatus.COMPLETED);
    expect(task1?.result).toBe(2);

    expect(task2?.status).toBe(TaskStatus.COMPLETED);
    expect(task2?.result).toBe(4);

    expect(task3?.status).toBe(TaskStatus.COMPLETED);
    expect(task3?.result).toBe(6);
  });

  test('should handle task failures', async () => {
    // Create processor that fails for even numbers
    const failingProcessor = vi.fn().mockImplementation(async (data: number) => {
      if (data % 2 === 0) {
        throw new Error('Even number error');
      }
      return data * 2;
    });

    // Create queue
    const queue = new TaskQueue(failingProcessor, { concurrency: 1 });

    // Add tasks
    queue.addTask('task1', 1);
    queue.addTask('task2', 2);
    queue.addTask('task3', 3);

    // Wait for queue to drain
    await new Promise<void>((resolve) => {
      queue.on(QueueEvent.QUEUE_DRAINED, resolve);
    });

    // Check task results
    const task1 = queue.getTask('task1');
    const task2 = queue.getTask('task2');
    const task3 = queue.getTask('task3');

    expect(task1?.status).toBe(TaskStatus.COMPLETED);
    expect(task1?.result).toBe(2);

    expect(task2?.status).toBe(TaskStatus.FAILED);
    expect(task2?.error?.message).toBe('Even number error');

    expect(task3?.status).toBe(TaskStatus.COMPLETED);
    expect(task3?.result).toBe(6);
  });

  test('should emit progress events', async () => {
    // Create queue
    const queue = new TaskQueue(mockProcessor, { concurrency: 1 });

    // Set up progress tracking
    const progressEvents: Array<{
      total: number;
      pending: number;
      running: number;
      completed: number;
      failed: number;
      progress: number;
    }> = [];
    queue.on(QueueEvent.QUEUE_PROGRESS, (progress) => {
      progressEvents.push({ ...progress });
    });

    // Add tasks
    queue.addTask('task1', 1);
    queue.addTask('task2', 2);

    // Wait for queue to drain
    await new Promise<void>((resolve) => {
      queue.on(QueueEvent.QUEUE_DRAINED, resolve);
    });

    // Check progress events
    expect(progressEvents.length).toBeGreaterThan(0);

    // First event should be after adding task1
    expect(progressEvents[0].total).toBe(1);
    expect(progressEvents[0].pending).toBe(1);
    expect(progressEvents[0].running).toBe(0);
    expect(progressEvents[0].completed).toBe(0);

    // Last event should be after completing all tasks
    const lastEvent = progressEvents[progressEvents.length - 1];
    expect(lastEvent.total).toBe(2);
    expect(lastEvent.pending).toBe(0);
    expect(lastEvent.running).toBe(0);
    expect(lastEvent.completed).toBe(2);
    expect(lastEvent.progress).toBe(100);
  });

  test('should handle task timeout', async () => {
    // Create processor that takes time
    const slowProcessor = vi.fn().mockImplementation(async (data: number) => {
      await new Promise((resolve) => setTimeout(resolve, data * 100));
      return data * 2;
    });

    // Create queue with short timeout
    const queue = new TaskQueue(slowProcessor, {
      concurrency: 1,
      timeout: 150,
    });

    // Add tasks
    queue.addTask('task1', 1); // Should complete (100ms)
    queue.addTask('task2', 2); // Should timeout (200ms)
    queue.addTask('task3', 1); // Should complete (100ms)

    // Wait for queue to drain
    await new Promise<void>((resolve) => {
      queue.on(QueueEvent.QUEUE_DRAINED, resolve);
    });

    // Check task results
    const task1 = queue.getTask('task1');
    const task2 = queue.getTask('task2');
    const task3 = queue.getTask('task3');

    expect(task1?.status).toBe(TaskStatus.COMPLETED);
    expect(task1?.result).toBe(2);

    expect(task2?.status).toBe(TaskStatus.FAILED);
    expect(task2?.error?.message).toContain('timed out');

    expect(task3?.status).toBe(TaskStatus.COMPLETED);
    expect(task3?.result).toBe(2);
  });
});
