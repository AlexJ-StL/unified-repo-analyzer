import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/error';
import { ToastProvider } from './hooks/useToast';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import RepositoriesPage from './pages/RepositoriesPage';
import SettingsPage from './pages/SettingsPage';
import RelationshipsPage from './pages/RelationshipsPage';

function App() {
  const handleGlobalError = (error: Error, errorInfo: any) => {
    // Log to external service in production
    console.error('Global error caught:', error, errorInfo);

    // You could send to error tracking service here
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };

  return (
    <ErrorBoundary onError={handleGlobalError}>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/repositories" element={<RepositoriesPage />} />
          <Route path="/relationships" element={<RelationshipsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
