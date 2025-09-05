import { io, type Socket } from 'socket.io-client';
import { useAnalysisStore } from '../store/useAnalysisStore';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private connected = false;

  // Initialize the WebSocket connection
  public connect(): void {
    if (this.socket) {
      return;
    }

    this.socket = io('http://localhost:3000', {
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  // Disconnect the WebSocket
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
      this.connected = false;
    }
  }

  // Check if socket is connected
  public isConnected(): boolean {
    return this.connected;
  }

  // Subscribe to analysis progress updates
  public subscribeToAnalysis(analysisId: string): void {
    if (this.socket) {
      this.socket.emit('register-analysis', analysisId);
    }
  }

  // Unsubscribe from analysis progress updates
  public unsubscribeFromAnalysis(_analysisId: string): void {
    if (this.socket) {
      // No explicit unsubscribe needed as rooms are cleaned up on disconnect
    }
  }

  // Set up event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.connected = true;

      // Update store with connection status
      useAnalysisStore.getState().setProgress({
        log: 'WebSocket connected',
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`WebSocket disconnected: ${reason}`);
      this.connected = false;

      // Update store with disconnection status
      useAnalysisStore.getState().setProgress({
        log: `WebSocket disconnected: ${reason}`,
      });
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      this.connected = false;

      // Update store with connection error
      useAnalysisStore.getState().setProgress({
        log: `WebSocket connection error: ${error.message}`,
      });

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.disconnect();

        // Update store with max reconnect attempts reached
        useAnalysisStore.getState().setProgress({
          log: 'Max reconnect attempts reached, giving up',
        });
      }
    });

    // Analysis progress events
    this.socket.on('analysis-progress', (data) => {
      const {
        status,
        currentFile,
        progress,
        total,
        processed,
        filesProcessed,
        totalFiles,
        timeElapsed,
        timeRemaining,
        tokensUsed,
      } = data;
      useAnalysisStore.getState().setProgress({
        status: status || 'processing',
        currentStep: currentFile || 'Processing files',
        progress: progress || 0,
        totalSteps: total || 100,
        filesProcessed: filesProcessed || processed || 0,
        totalFiles: totalFiles || total || 0,
        timeElapsed: timeElapsed || 0,
        timeRemaining: timeRemaining || 0,
        tokensUsed: tokensUsed || 0,
        log: `Processing: ${currentFile || 'files'}`,
      });
    });

    this.socket.on('analysis-complete', (data) => {
      useAnalysisStore.getState().setProgress({
        status: 'completed',
        progress: 100,
        totalSteps: 100,
        log: 'Analysis completed successfully',
      });
      useAnalysisStore.getState().setResults(data);
    });

    this.socket.on('batch-analysis-progress', (data) => {
      const {
        status,
        currentRepositories,
        progress,
        total,
        completed,
        failed,
        timeElapsed,
        timeRemaining,
      } = data;
      useAnalysisStore.getState().setProgress({
        status: status || 'processing',
        currentStep:
          currentRepositories?.length > 0
            ? `Processing: ${currentRepositories.join(', ')}`
            : 'Processing batch',
        progress: progress || 0,
        totalSteps: total || 100,
        filesProcessed: completed || 0,
        totalFiles: total || 0,
        timeElapsed: timeElapsed || 0,
        timeRemaining: timeRemaining || 0,
        log: `Batch progress: ${completed || 0}/${total || 0} completed, ${failed || 0} failed`,
      });
    });

    this.socket.on('batch-analysis-complete', (data) => {
      useAnalysisStore.getState().setProgress({
        status: 'completed',
        progress: 100,
        totalSteps: 100,
        log: 'Batch analysis completed successfully',
      });
      // For batch analysis, we might want to handle results differently
      // For now, we'll just set the first repository's results
      if (data.repositories && data.repositories.length > 0) {
        useAnalysisStore.getState().setResults(data.repositories[0]);
      }
    });
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
