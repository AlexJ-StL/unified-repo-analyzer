import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SearchInterface from '../SearchInterface';
import { useRepositoryStore } from '../../../store/useRepositoryStore';
import { apiService } from '../../../services/api';

// Mock the store
vi.mock('../../../store/useRepositoryStore', () => ({
  useRepositoryStore: vi.fn(),
}));

// Mock the API service
vi.mock('../../../services/api', () => ({
  apiService: {
    searchRepositories: vi.fn(),
  },
  handleApiError: vi.fn((err) => `Error: ${err.message}`),
}));

// Mock child components
vi.mock('../SearchFilters', () => ({
  default: () => <div data-testid="search-filters">Search Filters</div>,
}));

vi.mock('../SavedSearches', () => ({
  default: ({ onSelectSearch }: { onSelectSearch: (query: string) => void }) => (
    <div data-testid="saved-searches">
      <button onClick={() => onSelectSearch('test query')}>Select Search</button>
    </div>
  ),
}));

vi.mock('../Pagination', () => ({
  default: ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <div data-testid="pagination">
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  ),
}));

vi.mock('../RepositoryCard', () => ({
  default: ({
    repository,
    isSelected,
    onSelect,
    onView,
  }: {
    repository: any;
    isSelected: boolean;
    onSelect: () => void;
    onView: () => void;
  }) => (
    <div data-testid={`repo-card-${repository.id}`}>
      <div>{repository.name}</div>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        data-testid={`select-${repository.id}`}
      />
      <button onClick={onView} data-testid={`view-${repository.id}`}>
        View
      </button>
    </div>
  ),
}));

describe('SearchInterface', () => {
  const mockRepositories = [
    {
      id: '1',
      name: 'repo-1',
      path: '/path/to/repo-1',
      languages: ['JavaScript', 'TypeScript'],
      frameworks: ['React'],
      lastAnalyzed: '2023-04-15T10:30:00Z',
      size: 1024,
    },
    {
      id: '2',
      name: 'repo-2',
      path: '/path/to/repo-2',
      languages: ['Python'],
      frameworks: ['Django'],
      lastAnalyzed: '2023-04-14T14:20:00Z',
      size: 2048,
    },
  ];

  const mockStoreState = {
    repositories: mockRepositories,
    isLoading: false,
    error: null,
    searchQuery: '',
    filters: {
      languages: [],
      frameworks: [],
    },
    setRepositories: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    setSearchQuery: vi.fn(),
    setFilters: vi.fn(),
    clearFilters: vi.fn(),
    addRepository: vi.fn(),
    removeRepository: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRepositoryStore as any).mockReturnValue(mockStoreState);
    (apiService.searchRepositories as any).mockResolvedValue({
      data: {
        repositories: mockRepositories,
        total: mockRepositories.length,
      },
    });
  });

  it('renders the search interface with repositories', async () => {
    render(<SearchInterface />);

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByTestId('repo-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('repo-card-2')).toBeInTheDocument();
    });

    // Check if search filters and saved searches are rendered
    expect(screen.getByTestId('search-filters')).toBeInTheDocument();
    expect(screen.getByTestId('saved-searches')).toBeInTheDocument();
  });

  it('handles search input correctly', async () => {
    render(<SearchInterface />);

    const searchInput = screen.getByPlaceholderText('Search repositories...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(mockStoreState.setSearchQuery).toHaveBeenCalledWith('test query');
  });

  it('handles repository selection correctly', async () => {
    const onCompareRepositoriesMock = vi.fn();
    render(<SearchInterface onCompareRepositories={onCompareRepositoriesMock} />);

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByTestId('repo-card-1')).toBeInTheDocument();
    });

    // Select repositories
    fireEvent.click(screen.getByTestId('select-1'));
    fireEvent.click(screen.getByTestId('select-2'));

    // Click compare button
    fireEvent.click(screen.getByText('Compare Selected (2)'));

    expect(onCompareRepositoriesMock).toHaveBeenCalledWith(['1', '2']);
  });

  it('handles view repository correctly', async () => {
    const onSelectRepositoryMock = vi.fn();
    render(<SearchInterface onSelectRepository={onSelectRepositoryMock} />);

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByTestId('repo-card-1')).toBeInTheDocument();
    });

    // Click view button
    fireEvent.click(screen.getByTestId('view-1'));

    expect(onSelectRepositoryMock).toHaveBeenCalledWith('1');
  });

  it('handles saved search selection correctly', async () => {
    render(<SearchInterface />);

    // Click on saved search
    fireEvent.click(screen.getByText('Select Search'));

    expect(mockStoreState.setSearchQuery).toHaveBeenCalledWith('test query');
  });

  it('handles pagination correctly', async () => {
    (apiService.searchRepositories as any).mockResolvedValue({
      data: {
        repositories: mockRepositories,
        total: 30, // 3 pages with 10 items per page
      },
    });

    render(<SearchInterface />);

    // Wait for pagination to render
    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    // Click next page
    fireEvent.click(screen.getByText('Next'));

    // Should call API with updated page
    expect(apiService.searchRepositories).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        page: 2,
      })
    );
  });

  it('displays loading state correctly', async () => {
    (useRepositoryStore as any).mockReturnValue({
      ...mockStoreState,
      isLoading: true,
    });

    render(<SearchInterface />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays error state correctly', async () => {
    (useRepositoryStore as any).mockReturnValue({
      ...mockStoreState,
      error: 'Failed to load repositories',
    });

    render(<SearchInterface />);

    expect(screen.getByText('Failed to load repositories')).toBeInTheDocument();
  });

  it('displays empty state correctly', async () => {
    (useRepositoryStore as any).mockReturnValue({
      ...mockStoreState,
      repositories: [],
    });

    render(<SearchInterface />);

    expect(
      screen.getByText('No repositories found matching your search criteria.')
    ).toBeInTheDocument();
  });
});
