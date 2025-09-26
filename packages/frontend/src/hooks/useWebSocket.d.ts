interface WebSocketHookReturn {
  connection: WebSocket | null;
  isConnected: boolean;
  sendMessage: (msg: string) => void;
}

export declare const useWebSocket: (analysisId?: string) => WebSocketHookReturn;
export default useWebSocket;
