/**
 * WebSocket integration tests
 */

import { createServer } from "node:http";
import { Server } from "socket.io";
import Client from "socket.io-client";
import { describe, test, expect, beforeAll, afterAll } from "vitest";
import {
  initializeWebSocketHandlers,
  sendAnalysisComplete,
  sendAnalysisProgress,
} from "../websocket/index";

describe("WebSocket Tests", () => {
  let io: Server;
  let _serverSocket: any;
  let clientSocket: any;
  let httpServer: any;

  beforeAll(async () => {
    // Create HTTP server
    httpServer = createServer();

    // Create Socket.IO server
    io = new Server(httpServer);

    // Initialize WebSocket handlers
    initializeWebSocketHandlers(io);

    // Start server
    await new Promise<void>((resolve) => {
      httpServer.listen(() => {
        const port = (httpServer.address() as any).port;
        clientSocket = Client(`http://localhost:${port}`, {
          extraHeaders: {
            "x-client-id": "test-client",
          },
        });

        io.on("connection", (socket) => {
          _serverSocket = socket;
        });

        clientSocket.on("connect", resolve);
      });
    });
  });

  afterAll(async () => {
    io.close();
    clientSocket.close();
    httpServer.close();
    // Give some time for cleanup
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  test("should connect and join client-specific room", () => {
    // Check if client is in the room
    const rooms = io.sockets.adapter.rooms;
    expect(rooms.has("test-client")).toBeTruthy();
  });

  test("should register for analysis updates", async () => {
    // Register for analysis updates
    clientSocket.emit("register-analysis", "test-analysis");

    // Wait for room to be joined
    await new Promise((resolve) => setTimeout(resolve, 100));

    const rooms = io.sockets.adapter.rooms;
    expect(rooms.has("analysis:test-analysis")).toBeTruthy();
  });

  test("should receive analysis progress updates", async () => {
    // Register for analysis updates
    clientSocket.emit("register-analysis", "test-analysis");

    // Create a promise for the progress update
    const progressPromise = new Promise<void>((resolve) => {
      clientSocket.on("analysis-progress", (progress: any) => {
        expect(progress).toEqual({
          total: 10,
          processed: 5,
          status: "processing",
        });
        resolve();
      });
    });

    // Wait for room to be joined
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Send progress update
    sendAnalysisProgress(io, "test-analysis", {
      total: 10,
      processed: 5,
      status: "processing",
    });

    await progressPromise;
  });

  test("should receive analysis completion notification", async () => {
    // Register for analysis updates
    clientSocket.emit("register-analysis", "test-analysis");

    // Create a promise for the completion notification
    const completionPromise = new Promise<void>((resolve) => {
      clientSocket.on("analysis-complete", (result: any) => {
        expect(result).toEqual({
          id: "test-analysis",
          status: "completed",
        });
        resolve();
      });
    });

    // Wait for room to be joined
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Send completion notification
    sendAnalysisComplete(io, "test-analysis", {
      id: "test-analysis",
      status: "completed",
    });

    await completionPromise;
  });
});
