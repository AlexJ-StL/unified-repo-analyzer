import { useEffect } from 'react';
import websocketService from '../services/websocket';

export const useWebSocket = (analysisId?: string) => {
  useEffect(() => {
    // Connect to WebSocket when the hook is first used
    websocketService.connect();

    // Clean up on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    // Subscribe to analysis updates if an ID is provided
    if (analysisId) {
      websocketService.subscribeToAnalysis(analysisId);

      // Unsubscribe when the component unmounts or the ID changes
      return () => {
        websocketService.unsubscribeFromAnalysis(analysisId);
      };
    }
  }, [analysisId]);

  return websocketService;
};

export default useWebSocket;
