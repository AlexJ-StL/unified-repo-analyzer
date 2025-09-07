/**
 * WebSocket handlers for real-time updates
 */
import { Server } from 'socket.io';
/**
 * Initialize WebSocket handlers
 *
 * @param io - Socket.IO server instance
 */
export declare const initializeWebSocketHandlers: (io: Server) => void;
/**
 * Send analysis progress update
 *
 * @param io - Socket.IO server instance
 * @param analysisId - Analysis ID
 * @param progress - Progress data
 */
export declare const sendAnalysisProgress: (
  io: Server,
  analysisId: string,
  progress: unknown
) => void;
/**
 * Send analysis completion notification
 *
 * @param io - Socket.IO server instance
 * @param analysisId - Analysis ID
 * @param result - Analysis result
 */
export declare const sendAnalysisComplete: (
  io: Server,
  analysisId: string,
  result: unknown
) => void;
/**
 * Send batch analysis progress update
 *
 * @param io - Socket.IO server instance
 * @param batchId - Batch ID
 * @param progress - Progress data
 */
export declare const sendBatchProgress: (io: Server, batchId: string, progress: unknown) => void;
/**
 * Send batch analysis completion notification
 *
 * @param io - Socket.IO server instance
 * @param batchId - Batch ID
 * @param result - Batch result
 */
export declare const sendBatchComplete: (io: Server, batchId: string, result: unknown) => void;
