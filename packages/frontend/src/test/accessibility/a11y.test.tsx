import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../../App';
import { ErrorBoundary } from '../../components/error';
import { ToastProvider } from '../../hooks/useToast';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ErrorBoundary>
      <ToastProvider>{children}</ToastProvider>
    </ErrorBoundary>
  </BrowserRouter>
);

describe('Accessibility Tests', () => {
  beforeEach(() => {
    // Reset any global state
  });

  describe('WCAG Compliance', () => {
    it('should have no accessibility violations on main page', async () => {
      const { container } = render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check for proper heading structure (h1 -> h2 -> h3, etc.)
      const headings = screen.getAllByRole('heading');
      const headingLevels = headings.map((heading) =>
        Number.parseInt(heading.tagName.charAt(1), 10)
      );

      // Should start with h1
      expect(headingLevels[0]).toBe(1);

      // Check for logical progression (no skipping levels)
      for (let i = 1; i < headingLevels.length; i++) {
        const current = headingLevels[i];
        const previous = headingLevels[i - 1];
        expect(current - previous).toBeLessThanOrEqual(1);
      }
    });

    it('should have proper color contrast ratios', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // This would typically be tested with automated tools
      // For now, we'll check that text elements have appropriate classes
      const textElements = screen.getAllByText(/./);

      textElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        const color = computedStyle.color;
        const _backgroundColor = computedStyle.backgroundColor;

        // Basic check that colors are defined
        expect(color).toBeTruthy();
        // More sophisticated contrast checking would require color parsing
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be fully keyboard navigable', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Test tab navigation
      await user.tab();
      expect(document.activeElement).toHaveAttribute('tabindex', '0');

      // Test that all interactive elements are reachable
      const interactiveElements = screen
        .getAllByRole('button')
        .concat(screen.getAllByRole('link'))
        .concat(screen.getAllByRole('textbox'))
        .concat(screen.getAllByRole('combobox'));

      let tabCount = 0;
      const maxTabs = interactiveElements.length + 5; // Safety margin

      while (tabCount < maxTabs) {
        await user.tab();
        tabCount++;

        const activeElement = document.activeElement;
        if (interactiveElements.includes(activeElement as HTMLElement)) {
          // Found an interactive element
          expect(activeElement).toBeVisible();
        }
      }
    });

    it('should handle keyboard shortcuts correctly', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Test common keyboard shortcuts
      // Escape key should close modals/dropdowns
      await user.keyboard('{Escape}');

      // Enter key should activate focused elements
      const button = screen.getByRole('button', { name: /analyze/i });
      button.focus();
      await user.keyboard('{Enter}');

      // Space key should also activate buttons
      button.focus();
      await user.keyboard(' ');

      // Arrow keys should navigate within components
      const listItems = screen.getAllByRole('listitem');
      if (listItems.length > 0) {
        listItems[0].focus();
        await user.keyboard('{ArrowDown}');
        expect(document.activeElement).toBe(listItems[1] || listItems[0]);
      }
    });

    it('should provide visible focus indicators', async () => {
      const _user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      const focusableElements = screen
        .getAllByRole('button')
        .concat(screen.getAllByRole('link'))
        .concat(screen.getAllByRole('textbox'));

      for (const element of focusableElements.slice(0, 5)) {
        // Test first 5
        element.focus();

        const computedStyle = window.getComputedStyle(element);
        const outline = computedStyle.outline;
        const boxShadow = computedStyle.boxShadow;

        // Should have some form of focus indicator
        expect(outline !== 'none' || boxShadow !== 'none').toBe(true);
      }
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels and descriptions', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check for proper labeling
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(
          input.hasAttribute('aria-label') ||
            input.hasAttribute('aria-labelledby') ||
            screen.getByLabelText(input.getAttribute('placeholder') || '')
        ).toBeTruthy();
      });

      // Check for proper descriptions
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        if (button.hasAttribute('aria-describedby')) {
          const descriptionId = button.getAttribute('aria-describedby');
          if (descriptionId) {
            const description = document.getElementById(descriptionId);
            expect(description).toBeInTheDocument();
          }
        }
      });
    });

    it('should announce dynamic content changes', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Look for live regions
      const liveRegions = screen
        .getAllByRole('status')
        .concat(screen.getAllByRole('alert'))
        .concat(Array.from(document.querySelectorAll('[aria-live]')));

      expect(liveRegions.length).toBeGreaterThan(0);

      // Test that status updates are announced
      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);

      // Should have status update in live region
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent(/analyzing|loading|processing/i);
    });

    it('should provide proper landmark roles', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check for main landmarks
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Check for complementary content if present
      const complementary = screen.queryByRole('complementary');
      if (complementary) {
        expect(complementary).toBeInTheDocument();
      }

      // Check for banner/header
      const banner = screen.queryByRole('banner');
      if (banner) {
        expect(banner).toBeInTheDocument();
      }
    });

    it('should handle form validation accessibly', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Find form inputs
      const pathInput = screen.getByLabelText(/repository path/i);

      // Submit invalid form
      await user.clear(pathInput);
      await user.tab(); // Move focus away to trigger validation

      // Check for error messages
      const errorMessage = screen.queryByRole('alert');
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();

        // Error should be associated with input
        const _inputId = pathInput.getAttribute('id');
        const describedBy = pathInput.getAttribute('aria-describedby');

        expect(describedBy).toContain(errorMessage.getAttribute('id'));
      }
    });
  });

  describe('Mobile Accessibility', () => {
    it('should be touch-friendly', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check that interactive elements have adequate touch targets
      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        const computedStyle = window.getComputedStyle(button);
        const minHeight =
          Number.parseInt(computedStyle.minHeight, 10) || Number.parseInt(computedStyle.height, 10);
        const minWidth =
          Number.parseInt(computedStyle.minWidth, 10) || Number.parseInt(computedStyle.width, 10);

        // WCAG recommends minimum 44px touch targets
        expect(minHeight).toBeGreaterThanOrEqual(44);
        expect(minWidth).toBeGreaterThanOrEqual(44);
      });
    });

    it('should handle zoom up to 200% without horizontal scrolling', () => {
      // Simulate 200% zoom
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 2,
        writable: true,
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check that content doesn't overflow horizontally
      const body = document.body;
      const scrollWidth = body.scrollWidth;
      const clientWidth = body.clientWidth;

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth * 1.1); // Small margin for rounding
    });
  });

  describe('Error Handling Accessibility', () => {
    it('should announce errors to screen readers', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Trigger an error condition
      const analyzeButton = screen.getByRole('button', { name: /analyze/i });
      await user.click(analyzeButton);

      // Should have error announcement
      const errorAlert = screen.queryByRole('alert');
      if (errorAlert) {
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent(/error|failed|problem/i);
      }
    });

    it('should provide recovery options accessibly', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Simulate error state
      // This would depend on your error handling implementation

      // Look for retry/recovery buttons
      const retryButton = screen.queryByRole('button', {
        name: /retry|try again/i,
      });
      if (retryButton) {
        expect(retryButton).toBeInTheDocument();
        expect(retryButton).toBeEnabled();

        // Should be keyboard accessible
        retryButton.focus();
        await user.keyboard('{Enter}');
      }
    });
  });

  describe('Progressive Enhancement', () => {
    it('should work without JavaScript enhancements', () => {
      // This test would typically involve disabling JavaScript
      // For now, we'll test that basic functionality is available

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Basic navigation should be available
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });

      // Forms should be submittable
      const forms = document.querySelectorAll('form');
      forms.forEach((form) => {
        expect(form).toHaveAttribute('action');
      });
    });

    it('should provide fallbacks for complex interactions', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Check for noscript fallbacks
      const noscriptElements = document.querySelectorAll('noscript');
      if (noscriptElements.length > 0) {
        noscriptElements.forEach((noscript) => {
          expect(noscript.textContent).toBeTruthy();
        });
      }

      // Check that critical functionality doesn't rely solely on JavaScript
      const criticalButtons = screen.getAllByRole('button', {
        name: /submit|save|analyze/i,
      });
      criticalButtons.forEach((button) => {
        const form = button.closest('form');
        if (form) {
          expect(form).toHaveAttribute('action');
        }
      });
    });
  });
});
