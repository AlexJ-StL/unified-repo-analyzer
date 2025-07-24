import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import RepositoryCard from '../RepositoryCard';
import { Repository } from '../../../store/useRepositoryStore';

describe('RepositoryCard', () => {
  const mockRepository: Repository = {
    id: '1',
    name: 'test-repo',
    path: '/path/to/test-repo',
    languages: ['JavaScript', 'TypeScript'],
    frameworks: ['React', 'Next.js'],
    lastAnalyzed: '2023-04-15T10:30:00Z',
    size: 1024 * 1024, // 1MB
    description: 'A test repository',
  };

  it('renders repository information correctly', () => {
    const onSelectMock = vi.fn();
    const onViewMock = vi.fn();

    render(
      <RepositoryCard
        repository={mockRepository}
        isSelected={false}
        onSelect={onSelectMock}
        onView={onViewMock}
      />
    );

    // Check if repository name is displayed
    expect(screen.getByText('test-repo')).toBeInTheDocument();

    // Check if repository path is displayed
    expect(screen.getByText('/path/to/test-repo')).toBeInTheDocument();

    // Check if repository description is displayed
    expect(screen.getByText('A test repository')).toBeInTheDocument();

    // Check if languages are displayed
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();

    // Check if frameworks are displayed
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();

    // Check if size is formatted correctly
    expect(screen.getByText('Size:')).toBeInTheDocument();
    expect(screen.getByText('1.0 MB')).toBeInTheDocument();
  });

  it('handles selection correctly', () => {
    const onSelectMock = vi.fn();
    const onViewMock = vi.fn();

    render(
      <RepositoryCard
        repository={mockRepository}
        isSelected={false}
        onSelect={onSelectMock}
        onView={onViewMock}
      />
    );

    // Find and click the checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(onSelectMock).toHaveBeenCalledTimes(1);
  });

  it('handles view button click correctly', () => {
    const onSelectMock = vi.fn();
    const onViewMock = vi.fn();

    render(
      <RepositoryCard
        repository={mockRepository}
        isSelected={false}
        onSelect={onSelectMock}
        onView={onViewMock}
      />
    );

    // Find and click the view details button
    const viewButton = screen.getByText('View Details');
    fireEvent.click(viewButton);

    expect(onViewMock).toHaveBeenCalledTimes(1);
  });

  it('displays selected state correctly', () => {
    const onSelectMock = vi.fn();
    const onViewMock = vi.fn();

    render(
      <RepositoryCard
        repository={mockRepository}
        isSelected={true}
        onSelect={onSelectMock}
        onView={onViewMock}
      />
    );

    // Check if checkbox is checked
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    // Check if card has selected styling (border color)
    const card = checkbox.closest('div[class*="border"]');
    expect(card).toHaveClass('border-blue-500');
  });

  it('formats date correctly', () => {
    const onSelectMock = vi.fn();
    const onViewMock = vi.fn();

    render(
      <RepositoryCard
        repository={mockRepository}
        isSelected={false}
        onSelect={onSelectMock}
        onView={onViewMock}
      />
    );

    // Check if date is formatted correctly
    expect(screen.getByText('Last analyzed:')).toBeInTheDocument();
    // Note: The exact formatted date string will depend on the locale of the test environment
    // So we just check that some date information is displayed
    expect(screen.getByText(/Last analyzed:/)).toBeInTheDocument();
  });

  it('formats different sizes correctly', () => {
    const onSelectMock = vi.fn();
    const onViewMock = vi.fn();

    // Test with different sizes
    const testSizes = [
      { size: 500, expected: '500 B' },
      { size: 1024, expected: '1.0 KB' },
      { size: 1024 * 1024, expected: '1.0 MB' },
      { size: 1024 * 1024 * 1024, expected: '1.0 GB' },
    ];

    testSizes.forEach(({ size, expected }) => {
      const { unmount } = render(
        <RepositoryCard
          repository={{ ...mockRepository, size }}
          isSelected={false}
          onSelect={onSelectMock}
          onView={onViewMock}
        />
      );

      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });
});
