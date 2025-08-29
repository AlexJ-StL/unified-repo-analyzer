import type React from 'react';
import { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import websocketService from '../../services/websocket';
import { useAnalysisStore } from '../../store/useAnalysisStore';

interface ProgressTrackerProps {
  analysisId?: string;
  className?: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ analysisId, className = '' }) => {
  const { progress } = useAnalysisStore();
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

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
  }, [progress.log, logs]);

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
          <div className="text-center py-8">
            <p className="text-gray-500">No analysis in progress</p>
          </div>
        );

      case 'running':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{progress.currentStep || 'Processing...'}</h3>
                <p className="text-sm text-gray-500">
                  Step {Math.round(progress.progress)} of {progress.totalSteps}
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${(progress.progress / progress.totalSteps) * 100}%`,
                }}
              />
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
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
                <h3 className="text-sm font-medium text-green-800">
                  Analysis completed successfully
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>The repository analysis has been completed. You can now view the results.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'failed':
        return (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Analysis failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{progress.error || 'An unknown error occurred during analysis.'}</p>
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
    <div className={`progress-tracker ${className}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Analysis Progress</h2>
          <div className={`flex items-center ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-xs">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {renderStatusContent()}

      {/* Log display */}
      {logs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Activity Log</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 max-h-40 overflow-y-auto">
            <ul className="space-y-1 text-xs font-mono">
              {logs.map((log, index) => (
                <li key={index} className="text-gray-700">
                  <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
