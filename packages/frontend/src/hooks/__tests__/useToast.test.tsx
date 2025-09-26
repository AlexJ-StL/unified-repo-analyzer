import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '../useToast';

// Test component that uses the toast hook
const TestComponent = () => {
  const { showSuccess, showError, showWarning, showInfo, clearAllToasts } = useToast();

  return (
    <div>
      <button type="button" onClick={() => showSuccess('Success!', 'Operation completed')}>
        Show Success
      </button>
      <button type="button" onClick={() => showError('Error!', 'Something went wrong')}>
        Show Error
      </button>
      <button type="button" onClick={() => showWarning('Warning!', 'Be careful')}>
        Show Warning
      </button>
      <button type="button" onClick={() => showInfo('Info!', 'Just so you know')}>
        Show Info
      </button>
      <button type="button" onClick={clearAllToasts}>
        Clear All
      </button>
    </div>
  );
};

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderWithProvider = () => {
    return render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
  };

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');

    consoleError.mockRestore();
  });

  it('shows success toast', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Success'));

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('shows error toast', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Error'));

    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows warning toast', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Warning'));

    expect(screen.getByText('Warning!')).toBeInTheDocument();
    expect(screen.getByText('Be careful')).toBeInTheDocument();
  });

  it('shows info toast', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Info'));

    expect(screen.getByText('Info!')).toBeInTheDocument();
    expect(screen.getByText('Just so you know')).toBeInTheDocument();
  });

  it('shows multiple toasts', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('auto-removes success toasts after duration', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success!')).toBeInTheDocument();

    // Success toasts should auto-dismiss after 5 seconds + animation
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });

  it('does not auto-remove error toasts', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByText('Error!')).toBeInTheDocument();

    // Error toasts should not auto-dismiss
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('removes toast when close button is clicked', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success!')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    act(() => {
      vi.advanceTimersByTime(300); // Animation duration
    });

    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });

  it('clears all toasts', () => {
    renderWithProvider();

    fireEvent.click(screen.getByText('Show Success'));
    fireEvent.click(screen.getByText('Show Error'));

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Error!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Clear All'));

    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
    expect(screen.queryByText('Error!')).not.toBeInTheDocument();
  });

  it('handles toast with action', () => {
    const TestWithAction = () => {
      const { showError } = useToast();

      const handleShowError = () => {
        showError('Error!', 'Something went wrong', {
          label: 'Retry',
          onClick: () => console.log('Retry clicked'),
        });
      };

      return (
        <button type="button" onClick={handleShowError}>
          Show Error with Action
        </button>
      );
    };

    render(
      <ToastProvider>
        <TestWithAction />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Error with Action'));

    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
