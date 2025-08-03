import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import RepositoryComparison from '../RepositoryComparison';
import { apiService } from '../../../services/api';
// Mock the API service
vi.mock('../../../services/api', () => ({
    apiService: {
        getAnalysis: vi.fn(),
        searchRepositories: vi.fn(),
    },
    handleApiError: vi.fn((err) => `Error: ${err.message}`),
}));
describe('RepositoryComparison', () => {
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
    const mockComparisonData = {
        similarities: {
            languages: ['JavaScript'],
            frameworks: [],
            dependencies: ['lodash', 'axios'],
            patterns: ['MVC'],
        },
        differences: {
            languages: {
                '1': ['TypeScript'],
                '2': ['Python'],
            },
            frameworks: {
                '1': ['React'],
                '2': ['Django'],
            },
            dependencies: {
                '1': ['react-dom'],
                '2': ['django-rest-framework'],
            },
            size: {
                '1': 1024,
                '2': 2048,
            },
            complexity: {
                '1': 3,
                '2': 4,
            },
        },
        integrationPotential: {
            score: 7,
            reasons: ['Both repositories use JavaScript', 'Common dependencies can be shared'],
            suggestions: ['Create a monorepo structure', 'Share common utilities between projects'],
        },
    };
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock API responses
        apiService.getAnalysis.mockImplementation((id) => {
            const repo = mockRepositories.find((r) => r.id === id);
            return Promise.resolve({ data: repo });
        });
        apiService.searchRepositories.mockResolvedValue({
            data: {
                comparison: mockComparisonData,
            },
        });
    });
    it('renders loading state initially', async () => {
        render(<RepositoryComparison repositoryIds={['1', '2']} onClose={() => { }}/>);
        // Should show loading spinner
        expect(screen.getByRole('status')).toBeInTheDocument();
    });
    it('renders comparison data correctly', async () => {
        render(<RepositoryComparison repositoryIds={['1', '2']} onClose={() => { }}/>);
        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByText('Repository Comparison')).toBeInTheDocument();
        });
        // Check if repository names are displayed
        expect(screen.getByText('repo-1')).toBeInTheDocument();
        expect(screen.getByText('repo-2')).toBeInTheDocument();
        // Check if similarities are displayed
        expect(screen.getByText('Common Languages')).toBeInTheDocument();
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
        // Check if differences are displayed
        expect(screen.getByText('Differences')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Python')).toBeInTheDocument();
        // Check if integration potential is displayed
        expect(screen.getByText('Integration Potential')).toBeInTheDocument();
        expect(screen.getByText('7/10')).toBeInTheDocument();
        expect(screen.getByText('Both repositories use JavaScript')).toBeInTheDocument();
        expect(screen.getByText('Create a monorepo structure')).toBeInTheDocument();
    });
    it('handles API errors correctly', async () => {
        // Mock API error
        apiService.getAnalysis.mockRejectedValue(new Error('Failed to fetch repository data'));
        render(<RepositoryComparison repositoryIds={['1', '2']} onClose={() => { }}/>);
        // Wait for error to be displayed
        await waitFor(() => {
            expect(screen.getByText(/Error:/)).toBeInTheDocument();
        });
    });
    it('calls onClose when close button is clicked', async () => {
        const onCloseMock = vi.fn();
        render(<RepositoryComparison repositoryIds={['1', '2']} onClose={onCloseMock}/>);
        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByText('Repository Comparison')).toBeInTheDocument();
        });
        // Click close button
        const closeButton = screen.getByText('Close');
        closeButton.click();
        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
});
//# sourceMappingURL=RepositoryComparison.test.js.map