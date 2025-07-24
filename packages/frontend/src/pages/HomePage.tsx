import MainLayout from '../components/layout/MainLayout';

const HomePage = () => {
  return (
    <MainLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Welcome to Unified Repository Analyzer
        </h1>
        <p className="text-gray-600 mb-4">
          A comprehensive tool for analyzing code repositories, generating executive summaries, and
          creating technical breakdowns of your projects.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h2 className="text-lg font-medium text-blue-800 mb-2">Analyze Repository</h2>
            <p className="text-sm text-blue-600 mb-3">
              Select a repository to analyze and get detailed insights about its structure and code.
            </p>
            <a href="/analyze" className="text-blue-700 hover:text-blue-900 font-medium text-sm">
              Get started →
            </a>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h2 className="text-lg font-medium text-green-800 mb-2">Browse Repositories</h2>
            <p className="text-sm text-green-600 mb-3">
              View and search through your previously analyzed repositories.
            </p>
            <a
              href="/repositories"
              className="text-green-700 hover:text-green-900 font-medium text-sm"
            >
              View repositories →
            </a>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h2 className="text-lg font-medium text-purple-800 mb-2">Generate Reports</h2>
            <p className="text-sm text-purple-600 mb-3">
              Create and export reports in various formats (JSON, Markdown, HTML).
            </p>
            <a
              href="/reports"
              className="text-purple-700 hover:text-purple-900 font-medium text-sm"
            >
              Create reports →
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
