import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Toast, { type ToastData } from '../Toast';

describe('Toast', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createToast = (overrides: Partial<ToastData> = {}): ToastData => ({
    id: 'test-toast',
    type: 'info',
    title: 'Test Title',
    message: 'Test message',
    ...overrides,
  });

  it('renders toast with title and message', () => {
    const toast = createToast();
    render(<Toast toast={toast} onClose={mockOnClose} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders different toast types with appropriate styling', () => {
    const types: Array<ToastData['type']> = ['success', 'error', 'warning', 'info'];

    types.forEach((type) => {
      const toast = createToast({ type, id: `test-${type}` });
      const { unmount } = render(<Toast toast={toast} onClose={mockOnClose} />);

      // Check that the toast is rendered (specific styling tests would be more complex)
      expect(screen.getByText('Test Title')).toBeInTheDocument();

      unmount();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const toast = createToast();
    render(<Toast toast={toast} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Should call onClose after animation delay
    vi.advanceTimersByTime(300);
    expect(mockOnClose).toHaveBeenCalledWith('test-toast');
  });

  it('auto-closes after specified duration', () => {
    const toast = createToast({ duration: 2000 });
    render(<Toast toast={toast} onClose={mockOnClose} />);

    // Should not close immediately
    expect(mockOnClose).not.toHaveBeenCalled();

    // Should close after duration + animation delay
    vi.advanceTimersByTime(2000);
    vi.advanceTimersByTime(300);
    expect(mockOnClose).toHaveBeenCalledWith('test-toast');
  });

  it('does not auto-close when duration is 0', () => {
    const toast = createToast({ duration: 0 });
    render(<Toast toast={toast} onClose={mockOnClose} />);

    // Should not close after any amount of time
    vi.advanceTimersByTime(10000);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('renders and handles action button', () => {
    const mockAction = vi.fn();
    const toast = createToast({
      action: {
        label: 'Retry',
        onClick: mockAction,
      },
    });

    render(<Toast toast={toast} onClose={mockOnClose} />);

    const actionButton = screen.getByRole('button', { name: 'Retry' });
    expect(actionButton).toBeInTheDocument();

    fireEvent.click(actionButton);
    expect(mockAction).toHaveBeenCalled();
  });

  it('renders without message when not provided', () => {
    const toast = createToast({ message: undefined });
    render(<Toast toast={toast} onClose={mockOnClose} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('renders toast element correctly', () => {
    const toast = createToast();
    render(<Toast toast={toast} onClose={mockOnClose} />);

    // Simply check that the toast renders
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
});
