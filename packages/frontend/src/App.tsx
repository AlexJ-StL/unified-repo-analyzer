import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/error';
import { ToastProvider } from './hooks/useToast';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const AnalyzePage = lazy(() => import('./pages/AnalyzePage'));
const RepositoriesPage = lazy(() => import('./pages/RepositoriesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const RelationshipsPage = lazy(() => import('./pages/RelationshipsPage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/repositories" element={<RepositoriesPage />} />
            <Route path="/relationships" element={<RelationshipsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
