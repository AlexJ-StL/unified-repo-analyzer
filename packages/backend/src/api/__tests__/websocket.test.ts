/**
 * WebSocket integration tests
 */

import { createServer, type Server as HttpServer } from 'node:http';
import { Server, type Socket as ServerSocket } from 'socket.io';
import Client, { type Socket as ClientSocket } from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import {
  initializeWebSocketHandlers,
  sendAnalysisComplete,
  sendAnalysisProgress,
} from '../websocket/index.js';

describe('WebSocket Tests', () => {
  let io: Server;
  let _serverSocket: ServerSocket | undefined;
  let clientSocket: ClientSocket | undefined;
  let httpServer: HttpServer;

  beforeAll(async () => {
    // Create HTTP server
    httpServer = createServer();

    // Create Socket.IO server
    io = new Server(httpServer);

    // Initialize WebSocket handlers
    initializeWebSocketHandlers(io);

    // Start server
    await new Promise<void>((resolve, reject) => {
      httpServer.listen(() => {
        const port = (httpServer.address() as { port: number }).port;
        clientSocket = Client(`http://localhost:${port}`, {
          extraHeaders: {
            'x-client-id': 'test-client',
          },
        });

        // Ensure io is treated as Server in this context for type safety on .on
        io.on('connection', (socket: ServerSocket) => {
          _serverSocket = socket;
        });

        clientSocket.on('connect', resolve);
        clientSocket.on('error', reject); // Handle connection errors
      });
    });
  });

  afterAll(async () => {
    // Close Socket.IO server
    if (io) {
      io.close();
    }

    // Close client socket
    if (clientSocket) {
      clientSocket.disconnect(); // Use disconnect for client socket
      clientSocket.off(); // Remove all event listeners
    }

    // Close HTTP server
    if (httpServer?.listening) {
      await new Promise((resolve, reject) => {
        httpServer.close((err) => (err ? reject(err) : resolve(undefined)));
      });
    }

    // Give some time for cleanup
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  test('should connect and join client-specific room', () => {
    if (!io) {
      throw new Error('Socket.IO server is not initialized');
    }
    // Check if client is in the room
    const rooms = io.sockets.adapter.rooms;
    expect(rooms.has('test-client')).toBeTruthy();
  });

  test('should register for analysis updates', async () => {
    if (!clientSocket) {
      throw new Error('Client socket is not initialized');
    }
    // Register for analysis updates
    clientSocket.emit('register-analysis', 'test-analysis');

    // Wait for room to be joined
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (!io) {
      throw new Error('Socket.IO server is not initialized');
    }
    const rooms = io.sockets.adapter.rooms;
    expect(rooms.has('analysis:test-analysis')).toBeTruthy();
  });

  test('should receive analysis progress updates', async () => {
    if (!clientSocket) {
      throw new Error('Client socket is not initialized');
    }
    // Register for analysis updates
    clientSocket.emit('register-analysis', 'test-analysis');

    const currentClientSocket = clientSocket; // Capture for use in handlers

    // Create a promise for the progress update
    const progressPromise = new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        currentClientSocket?.off('analysis-progress', progressHandler);
        reject(new Error('Timeout waiting for analysis-progress'));
      }, 1000); // 1 second timeout

      const progressHandler = (progress: unknown) => {
        try {
          expect(progress).toEqual({
            total: 10,
            processed: 5,
            status: 'processing',
          });
          clearTimeout(timeoutId);
          currentClientSocket?.off('analysis-progress', progressHandler); // Remove listener
          resolve();
        } catch (error) {
          clearTimeout(timeoutId);
          currentClientSocket?.off('analysis-progress', progressHandler); // Remove listener
          reject(error);
        }
      };

      currentClientSocket.on('analysis-progress', progressHandler);
    });

    // Wait for room to be joined (ensure client socket is fully connected and registered)
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (!io) {
      throw new Error('Socket.IO server is not initialized for sending progress');
    }
    // Send progress update
    sendAnalysisProgress(io, 'test-analysis', {
      total: 10,
      processed: 5,
      status: 'processing',
    });

    await progressPromise;
  });

  test('should receive analysis completion notification', async () => {
    if (!clientSocket) {
      throw new Error('Client socket is not initialized');
    }
    // Register for analysis updates
    clientSocket.emit('register-analysis', 'test-analysis');

    const currentClientSocket = clientSocket; // Capture for use in handlers

    // Create a promise for the completion notification
    const completionPromise = new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        currentClientSocket?.off('analysis-complete', completionHandler);
        reject(new Error('Timeout waiting for analysis-complete'));
      }, 1000); // 1 second timeout

      const completionHandler = (result: unknown) => {
        try {
          expect(result).toEqual({
            id: 'test-analysis',
            status: 'completed',
          });
          clearTimeout(timeoutId);
          currentClientSocket?.off('analysis-complete', completionHandler); // Remove listener
          resolve();
        } catch (error) {
          clearTimeout(timeoutId);
          currentClientSocket?.off('analysis-complete', completionHandler); // Remove listener
          reject(error);
        }
      };

      currentClientSocket.on('analysis-complete', completionHandler);
    });

    // Wait for room to be joined (ensure client socket is fully connected and registered)
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (!io) {
      throw new Error('Socket.IO server is not initialized for sending completion');
    }
    // Send completion notification
    sendAnalysisComplete(io, 'test-analysis', {
      id: 'test-analysis',
      status: 'completed',
    });

    await completionPromise;
  });
});
