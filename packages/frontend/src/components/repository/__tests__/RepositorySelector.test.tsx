import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { fileSystemService } from '../../../services/fileSystem';
import { useAnalysisStore } from '../../../store/useAnalysisStore';
import RepositorySelector from '../RepositorySelector';

// Mock the fileSystemService
vi.mock('../../../services/fileSystem', () => ({
  fileSystemService: {
    getHomeDirectory: vi.fn().mockResolvedValue('/home/user'),
    browseDirectory: vi.fn().mockResolvedValue({
      path: '/home/user',
      items: [
        { name: 'Documents', path: '/home/user/Documents', isDirectory: true },
        { name: 'Projects', path: '/home/user/Projects', isDirectory: true },
        { name: 'file.txt', path: '/home/user/file.txt', isDirectory: false },
      ],
    }),
    validateDirectory: vi.fn().mockResolvedValue({ valid: true }),
    getRecentRepositories: vi
      .fn()
      .mockResolvedValue(['/home/user/Projects/repo1', '/home/user/Projects/repo2']),
  },
}));

// Mock the Zustand store
vi.mock('../../../store/useAnalysisStore');

describe('RepositorySelector', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock store
    vi.mocked(useAnalysisStore).mockReturnValue({
      repositoryPath: '',
      setRepositoryPath: vi.fn(),
    });
  });

  it('renders correctly with initial state', async () => {
    render(<RepositorySelector />);

    // Check if component renders with loading state initially
    expect(screen.getByLabelText(/Repository Path/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse/i)).toBeInTheDocument();

    // Wait for home directory to load
    await waitFor(() => {
      expect(fileSystemService.getHomeDirectory).toHaveBeenCalled();
    });
  });

  it('displays directory contents when loaded', async () => {
    render(<RepositorySelector />);

    // Wait for directory contents to load
    await waitFor(() => {
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('file.txt')).toBeInTheDocument();
    });
  });

  it('navigates to a directory when clicked', async () => {
    render(<RepositorySelector />);

    // Wait for directory contents to load
    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    // Setup mock for next directory
    vi.mocked(fileSystemService.browseDirectory).mockResolvedValueOnce({
      path: '/home/user/Projects',
      items: [
        { name: 'repo1', path: '/home/user/Projects/repo1', isDirectory: true },
        { name: 'repo2', path: '/home/user/Projects/repo2', isDirectory: true },
      ],
    });

    // Click on Projects directory
    fireEvent.click(screen.getByText('Projects'));

    // Check if browseDirectory was called with correct path
    expect(fileSystemService.browseDirectory).toHaveBeenCalledWith('/home/user/Projects');

    // Wait for new directory contents to load
    await waitFor(() => {
      expect(screen.getByText('repo1')).toBeInTheDocument();
      expect(screen.getByText('repo2')).toBeInTheDocument();
    });
  });

  it('selects a repository when Select Repository button is clicked', async () => {
    const mockSetRepositoryPath = vi.fn();
    vi.mocked(useAnalysisStore).mockReturnValue({
      repositoryPath: '',
      setRepositoryPath: mockSetRepositoryPath,
    });

    render(<RepositorySelector />);

    // Wait for directory contents to load
    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    // Setup mock for next directory
    vi.mocked(fileSystemService.browseDirectory).mockResolvedValueOnce({
      path: '/home/user/Projects/repo1',
      items: [
        { name: '.git', path: '/home/user/Projects/repo1/.git', isDirectory: true },
        { name: 'src', path: '/home/user/Projects/repo1/src', isDirectory: true },
        { name: 'README.md', path: '/home/user/Projects/repo1/README.md', isDirectory: false },
      ],
    });

    // Navigate to a repository
    fireEvent.change(screen.getByLabelText(/Repository Path/i), {
      target: { value: '/home/user/Projects/repo1' },
    });
    fireEvent.keyDown(screen.getByLabelText(/Repository Path/i), { key: 'Enter' });

    // Wait for directory contents to load
    await waitFor(() => {
      expect(fileSystemService.browseDirectory).toHaveBeenCalledWith('/home/user/Projects/repo1');
    });

    // Click Select Repository button
    fireEvent.click(screen.getByText('Select Repository'));

    // Check if setRepositoryPath was called with correct path
    expect(mockSetRepositoryPath).toHaveBeenCalledWith('/home/user/Projects/repo1');
  });

  it('displays recent repositories when available', async () => {
    render(<RepositorySelector />);

    // Wait for recent repositories to load
    await waitFor(() => {
      expect(screen.getByText('Recent Repositories')).toBeInTheDocument();
      expect(screen.getByText('repo1')).toBeInTheDocument();
      expect(screen.getByText('repo2')).toBeInTheDocument();
    });

    // Setup mock for repository directory
    vi.mocked(fileSystemService.browseDirectory).mockResolvedValueOnce({
      path: '/home/user/Projects/repo1',
      items: [
        { name: '.git', path: '/home/user/Projects/repo1/.git', isDirectory: true },
        { name: 'src', path: '/home/user/Projects/repo1/src', isDirectory: true },
      ],
    });

    // Click on a recent repository
    fireEvent.click(screen.getByText('repo1'));

    // Check if browseDirectory was called with correct path
    expect(fileSystemService.browseDirectory).toHaveBeenCalledWith('/home/user/Projects/repo1');
  });
});
