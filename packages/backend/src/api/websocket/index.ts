/**
 * WebSocket handlers for real-time updates
 */

import { Server, Socket } from 'socket.io';

/**
 * Initialize WebSocket handlers
 *
 * @param io - Socket.IO server instance
 */
export const initializeWebSocketHandlers = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join client-specific room for targeted updates
    const clientId = (socket.handshake.headers['x-client-id'] as string) || socket.id;
    socket.join(clientId);

    // Handle client registration for specific analysis
    socket.on('register-analysis', (analysisId: string) => {
      console.log(`Client ${socket.id} registered for analysis ${analysisId}`);
      socket.join(`analysis:${analysisId}`);
    });

    // Handle client registration for batch analysis
    socket.on('register-batch', (batchId: string) => {
      console.log(`Client ${socket.id} registered for batch ${batchId}`);
      socket.join(`batch:${batchId}`);
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

/**
 * Send analysis progress update
 *
 * @param io - Socket.IO server instance
 * @param analysisId - Analysis ID
 * @param progress - Progress data
 */
export const sendAnalysisProgress = (io: Server, analysisId: string, progress: any): void => {
  io.to(`analysis:${analysisId}`).emit('analysis-progress', progress);
};

/**
 * Send analysis completion notification
 *
 * @param io - Socket.IO server instance
 * @param analysisId - Analysis ID
 * @param result - Analysis result
 */
export const sendAnalysisComplete = (io: Server, analysisId: string, result: any): void => {
  io.to(`analysis:${analysisId}`).emit('analysis-complete', result);
};

/**
 * Send batch analysis progress update
 *
 * @param io - Socket.IO server instance
 * @param batchId - Batch ID
 * @param progress - Progress data
 */
export const sendBatchProgress = (io: Server, batchId: string, progress: any): void => {
  io.to(`batch:${batchId}`).emit('batch-analysis-progress', progress);
};

/**
 * Send batch analysis completion notification
 *
 * @param io - Socket.IO server instance
 * @param batchId - Batch ID
 * @param result - Batch result
 */
export const sendBatchComplete = (io: Server, batchId: string, result: any): void => {
  io.to(`batch:${batchId}`).emit('batch-analysis-complete', result);
};
