import MainLayout from '../components/layout/MainLayout';

const RepositoriesPage = () => {
  // Mock data for repositories
  const repositories = [
    {
      id: '1',
      name: 'example-repo',
      path: '/path/to/example-repo',
      languages: ['JavaScript', 'TypeScript'],
      lastAnalyzed: '2023-04-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'another-project',
      path: '/path/to/another-project',
      languages: ['Python', 'JavaScript'],
      lastAnalyzed: '2023-04-14T14:20:00Z',
    },
    {
      id: '3',
      name: 'test-repository',
      path: '/path/to/test-repository',
      languages: ['Java', 'Kotlin'],
      lastAnalyzed: '2023-04-13T09:15:00Z',
    },
  ];

  return (
    <MainLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Repositories</h1>
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                className="rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search repositories..."
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Analyze New
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Path
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Languages
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Last Analyzed
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {repositories.map((repo) => (
                <tr key={repo.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {repo.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{repo.path}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {repo.languages.map((lang) => (
                        <span
                          key={lang}
                          className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(repo.lastAnalyzed).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button type="button" className="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                      <button type="button" className="text-green-600 hover:text-green-900">
                        Re-analyze
                      </button>
                      <button type="button" className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default RepositoriesPage;
