import type React from 'react';
import { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import websocketService from '../../services/websocket';
import { useAnalysisStore } from '../../store/useAnalysisStore';

interface MobileProgressTrackerProps {
  analysisId?: string;
  className?: string;
}

const MobileProgressTracker: React.FC<MobileProgressTrackerProps> = ({
  analysisId,
  className = '',
}) => {
  const { progress } = useAnalysisStore();
  const [isConnected, setIsConnected] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    websocketService.connect();

    // Check connection status
    const checkConnection = setInterval(() => {
      setIsConnected(websocketService.isConnected());
    }, 2000);

    return () => {
      clearInterval(checkConnection);
    };
  }, []);

  // Subscribe to analysis updates when analysisId changes
  useEffect(() => {
    if (analysisId) {
      websocketService.subscribeToAnalysis(analysisId);

      // Add subscription log
      setLogs((prev) => [...prev, `Subscribed to analysis ${analysisId}`]);

      return () => {
        websocketService.unsubscribeFromAnalysis(analysisId);
      };
    }
  }, [analysisId]);

  // Listen for log updates from the store
  useEffect(() => {
    if (progress.log && !logs.includes(progress.log)) {
      setLogs((prev) => [...prev, progress.log!]);
    }
  }, [progress.log]); // Remove logs from dependencies to avoid infinite loop

  // Handle cancellation
  const handleCancel = async () => {
    if (!analysisId) return;

    try {
      await apiService.cancelAnalysis(analysisId);
      setLogs((prev) => [...prev, 'Analysis cancellation requested']);
    } catch (_error) {
      setLogs((prev) => [...prev, 'Failed to cancel analysis']);
    }
  };

  // Render different UI based on status
  const renderStatusContent = () => {
    switch (progress.status) {
      case 'idle':
        return (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No analysis in progress</p>
          </div>
        );

      case 'processing':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm">{progress.currentStep || 'Processing...'}</h3>
                <p className="text-xs text-gray-500">{Math.round(progress.progress)}%</p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${(progress.progress / progress.totalSteps) * 100}%`,
                }}
              />
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-4 w-4 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-label="Success"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-green-800">Analysis completed</h3>
              </div>
            </div>
          </div>
        );

      case 'failed':
        return (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-4 w-4 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-label="Error"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-xs font-medium text-red-800">Analysis failed</h3>
                <div className="mt-1 text-xs text-red-700">
                  <p>{progress.error || 'Unknown error'}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`mobile-progress-tracker ${className}`}>
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">Analysis Progress</h2>
          <div className={`flex items-center ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            <span
              className={`inline-block w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-xs">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {renderStatusContent()}

      {/* Log display toggle */}
      {logs.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="text-xs text-blue-600 flex items-center"
          >
            {showLogs ? 'Hide logs' : 'Show logs'}
            <svg
              className={`ml-1 h-3 w-3 transform ${showLogs ? 'rotate-180' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-label={showLogs ? 'Hide logs' : 'Show logs'}
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {showLogs && (
            <div className="mt-2 bg-gray-50 border border-gray-200 rounded-md p-2 max-h-24 overflow-y-auto">
              <ul className="space-y-1 text-xs font-mono">
                {logs.slice(-5).map((log, index) => (
                  <li key={`log-${index}-${log.slice(0, 50)}`} className="text-gray-700 truncate">
                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileProgressTracker;
