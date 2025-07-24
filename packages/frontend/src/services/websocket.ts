import { io, Socket } from 'socket.io-client';
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
      this.socket.emit('subscribe', { analysisId });
    }
  }

  // Unsubscribe from analysis progress updates
  public unsubscribeFromAnalysis(analysisId: string): void {
    if (this.socket) {
      this.socket.emit('unsubscribe', { analysisId });
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
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      this.connected = false;

      // Update store with connection error
      useAnalysisStore.getState().setProgress({
        log: `WebSocket connection error: ${error.message}`,
      });

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnect attempts reached, giving up');
        this.disconnect();

        // Update store with max reconnect attempts reached
        useAnalysisStore.getState().setProgress({
          log: 'Max reconnect attempts reached, giving up',
        });
      }
    });

    // Analysis progress events
    this.socket.on('analysis:progress', (data) => {
      const { status, currentStep, progress, totalSteps, log } = data;
      useAnalysisStore.getState().setProgress({
        status,
        currentStep,
        progress,
        totalSteps,
        log: log || `Progress: ${progress}/${totalSteps} - ${currentStep}`,
      });
    });

    this.socket.on('analysis:completed', (data) => {
      useAnalysisStore.getState().setProgress({
        status: 'completed',
        progress: 100,
        totalSteps: 100,
        log: 'Analysis completed successfully',
      });
      useAnalysisStore.getState().setResults(data.results);
    });

    this.socket.on('analysis:error', (data) => {
      useAnalysisStore.getState().setProgress({
        status: 'failed',
        error: data.error,
        log: `Analysis failed: ${data.error}`,
      });
    });

    // Log message event
    this.socket.on('analysis:log', (data) => {
      useAnalysisStore.getState().setProgress({
        log: data.message,
      });
    });
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
