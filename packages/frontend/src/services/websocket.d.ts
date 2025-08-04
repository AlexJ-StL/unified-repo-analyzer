declare class WebSocketService {
  private socket;
  private reconnectAttempts;
  private maxReconnectAttempts;
  private reconnectDelay;
  private connected;
  connect(): void;
  disconnect(): void;
  isConnected(): boolean;
  subscribeToAnalysis(analysisId: string): void;
  unsubscribeFromAnalysis(analysisId: string): void;
  private setupEventListeners;
}
declare const websocketService: WebSocketService;
export default websocketService;
