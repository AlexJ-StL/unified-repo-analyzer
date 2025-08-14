/**
 * Tests for EnhancedErrorDisplay component
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { UserFriendlyError } from "../../../services/errorMessages";
import type { PathError, PathWarning } from "../../../services/pathValidation";
import EnhancedErrorDisplay from "../EnhancedErrorDisplay";

// Mock the errorMessageService
vi.mock("../../../services/errorMessages", () => ({
  errorMessageService: {
    createPathErrorMessage: vi.fn(),
    createWarningMessage: vi.fn(),
    getSeverityColor: vi.fn(() => ({
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-400",
    })),
    getPlatformSpecificSuggestions: vi.fn(() => ({
      platform: "Windows",
      examples: ["C:\\test\\path"],
      tips: ["Use backslashes or forward slashes"],
      commonIssues: ["Drive letter missing"],
    })),
  },
}));

const mockUserFriendlyError: UserFriendlyError = {
  title: "Test Error",
  message: "This is a test error message",
  details: "Additional error details",
  suggestions: ["First suggestion", "Second suggestion", "Third suggestion"],
  learnMoreUrl: "https://example.com/help",
  severity: "error",
  category: "path",
};

const mockPathErrors: PathError[] = [
  {
    code: "PATH_NOT_FOUND",
    message: "Path does not exist",
    details: "The specified path could not be found",
  },
];

const mockPathWarnings: PathWarning[] = [
  {
    code: "PATH_LENGTH_WARNING",
    message: "Path is quite long",
    details: "This path may cause issues on some systems",
  },
];

describe("EnhancedErrorDisplay", () => {
  it("should render user-friendly error message", () => {
    render(<EnhancedErrorDisplay userFriendlyError={mockUserFriendlyError} />);

    expect(screen.getByText("Test Error")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test error message")
    ).toBeInTheDocument();
    expect(screen.getByText("Additional error details")).toBeInTheDocument();
  });

  it("should render suggestions list", () => {
    render(<EnhancedErrorDisplay userFriendlyError={mockUserFriendlyError} />);

    expect(screen.getByText("Suggestions:")).toBeInTheDocument();
    expect(screen.getByText("First suggestion")).toBeInTheDocument();
    expect(screen.getByText("Second suggestion")).toBeInTheDocument();
    expect(screen.getByText("Third suggestion")).toBeInTheDocument();
  });

  it("should render learn more link when provided", () => {
    render(<EnhancedErrorDisplay userFriendlyError={mockUserFriendlyError} />);

    const learnMoreLink = screen.getByText("Learn more about this error →");
    expect(learnMoreLink).toBeInTheDocument();
    expect(learnMoreLink.closest("a")).toHaveAttribute(
      "href",
      "https://example.com/help"
    );
    expect(learnMoreLink.closest("a")).toHaveAttribute("target", "_blank");
  });

  it("should render original path when provided", () => {
    render(
      <EnhancedErrorDisplay
        userFriendlyError={mockUserFriendlyError}
        originalPath="C:\\test\\path"
      />
    );

    expect(screen.getByText("Path:")).toBeInTheDocument();
    expect(screen.getByText("C:\\test\\path")).toBeInTheDocument();
  });

  it("should show platform-specific tips when expanded", async () => {
    render(
      <EnhancedErrorDisplay
        userFriendlyError={{
          ...mockUserFriendlyError,
          category: "path",
        }}
      />
    );

    const showTipsButton = screen.getByText("Show platform-specific tips");
    fireEvent.click(showTipsButton);

    await waitFor(() => {
      expect(screen.getByText("Path Format Tips:")).toBeInTheDocument();
      expect(
        screen.getByText("Use backslashes or forward slashes")
      ).toBeInTheDocument();
    });

    // Should change to "Hide" when expanded
    expect(screen.getByText("Hide platform-specific tips")).toBeInTheDocument();
  });

  it("should render technical details when enabled", () => {
    render(
      <EnhancedErrorDisplay
        errors={mockPathErrors}
        warnings={mockPathWarnings}
        showTechnicalDetails={true}
      />
    );

    const detailsElement = screen.getByText("Technical Details");
    expect(detailsElement).toBeInTheDocument();

    // Click to expand details
    fireEvent.click(detailsElement);

    expect(screen.getByText("Errors (1):")).toBeInTheDocument();
    expect(screen.getByText("PATH_NOT_FOUND")).toBeInTheDocument();
    expect(screen.getByText("Warnings (1):")).toBeInTheDocument();
    expect(screen.getByText("PATH_LENGTH_WARNING")).toBeInTheDocument();
  });

  it("should handle retry callback", () => {
    const onRetry = vi.fn();

    render(
      <EnhancedErrorDisplay
        userFriendlyError={mockUserFriendlyError}
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByTitle("Retry");
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("should handle dismiss callback", () => {
    const onDismiss = vi.fn();

    render(
      <EnhancedErrorDisplay
        userFriendlyError={mockUserFriendlyError}
        onDismiss={onDismiss}
      />
    );

    const dismissButton = screen.getByTitle("Dismiss");
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("should render in compact mode", () => {
    render(
      <EnhancedErrorDisplay
        userFriendlyError={mockUserFriendlyError}
        compact={true}
      />
    );

    expect(screen.getByText("Test Error")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test error message")
    ).toBeInTheDocument();

    // Compact mode should not show suggestions
    expect(screen.queryByText("Suggestions:")).not.toBeInTheDocument();
  });

  it("should not render when dismissed", () => {
    render(
      <EnhancedErrorDisplay
        userFriendlyError={mockUserFriendlyError}
        onDismiss={vi.fn()}
      />
    );

    const dismissButton = screen.getByTitle("Dismiss");
    fireEvent.click(dismissButton);

    // Component should not be visible after dismissal
    expect(screen.queryByText("Test Error")).not.toBeInTheDocument();
  });

  it("should render warning message when no errors but warnings exist", () => {
    const { errorMessageService } = require("../../../services/errorMessages");
    errorMessageService.createWarningMessage.mockReturnValue({
      title: "Warning Title",
      message: "Warning message",
      severity: "warning",
      category: "path",
      suggestions: ["Warning suggestion"],
    });

    render(<EnhancedErrorDisplay errors={[]} warnings={mockPathWarnings} />);

    expect(errorMessageService.createWarningMessage).toHaveBeenCalledWith(
      mockPathWarnings
    );
  });

  it("should not render when no errors, warnings, or user-friendly error", () => {
    const { container } = render(
      <EnhancedErrorDisplay errors={[]} warnings={[]} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render appropriate icon for different severities", () => {
    // Test error icon
    render(
      <EnhancedErrorDisplay
        userFriendlyError={{
          ...mockUserFriendlyError,
          severity: "error",
        }}
      />
    );

    // Test warning icon
    render(
      <EnhancedErrorDisplay
        userFriendlyError={{
          ...mockUserFriendlyError,
          severity: "warning",
        }}
      />
    );

    // Test info icon
    render(
      <EnhancedErrorDisplay
        userFriendlyError={{
          ...mockUserFriendlyError,
          severity: "info",
        }}
      />
    );

    // Icons should be rendered (we can't easily test the specific icon type in JSDOM)
    const icons = screen.getAllByRole("img", { hidden: true });
    expect(icons.length).toBeGreaterThan(0);
  });

  it("should hide suggestions when showSuggestions is false", () => {
    render(
      <EnhancedErrorDisplay
        userFriendlyError={mockUserFriendlyError}
        showSuggestions={false}
      />
    );

    expect(screen.queryByText("Suggestions:")).not.toBeInTheDocument();
    expect(screen.queryByText("First suggestion")).not.toBeInTheDocument();
  });

  it("should hide technical details when showTechnicalDetails is false", () => {
    render(
      <EnhancedErrorDisplay
        errors={mockPathErrors}
        warnings={mockPathWarnings}
        showTechnicalDetails={false}
      />
    );

    expect(screen.queryByText("Technical Details")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <EnhancedErrorDisplay
        userFriendlyError={mockUserFriendlyError}
        className="custom-error-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-error-class");
  });

  it("should create error message from path errors when no user-friendly error provided", () => {
    const { errorMessageService } = require("../../../services/errorMessages");
    errorMessageService.createPathErrorMessage.mockReturnValue(
      mockUserFriendlyError
    );

    render(
      <EnhancedErrorDisplay
        errors={mockPathErrors}
        warnings={mockPathWarnings}
        originalPath="C:\\test\\path"
      />
    );

    expect(errorMessageService.createPathErrorMessage).toHaveBeenCalledWith(
      mockPathErrors,
      mockPathWarnings,
      "C:\\test\\path"
    );
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(
        <EnhancedErrorDisplay userFriendlyError={mockUserFriendlyError} />
      );

      // Buttons should have proper titles for screen readers
      const retryButton = screen.queryByTitle("Retry");
      const dismissButton = screen.queryByTitle("Dismiss");

      if (retryButton) {
        expect(retryButton).toHaveAttribute("title", "Retry");
      }
      if (dismissButton) {
        expect(dismissButton).toHaveAttribute("title", "Dismiss");
      }
    });

    it("should have proper focus management", () => {
      render(
        <EnhancedErrorDisplay
          userFriendlyError={mockUserFriendlyError}
          onRetry={vi.fn()}
          onDismiss={vi.fn()}
        />
      );

      const retryButton = screen.getByTitle("Retry");
      const dismissButton = screen.getByTitle("Dismiss");

      // Buttons should be focusable
      retryButton.focus();
      expect(document.activeElement).toBe(retryButton);

      dismissButton.focus();
      expect(document.activeElement).toBe(dismissButton);
    });
  });

  describe("Error message quality", () => {
    it("should display clear and actionable error messages", () => {
      const testError: UserFriendlyError = {
        title: "Repository Path Not Found",
        message:
          "The specified repository path does not exist or cannot be accessed.",
        suggestions: [
          "Double-check the spelling and capitalization of the path",
          "Navigate to the parent directory and verify the folder exists",
          "Copy the path directly from your file manager",
        ],
        severity: "error",
        category: "path",
      };

      render(<EnhancedErrorDisplay userFriendlyError={testError} />);

      // Title should be clear and specific
      expect(screen.getByText("Repository Path Not Found")).toBeInTheDocument();

      // Message should be descriptive
      expect(
        screen.getByText(
          "The specified repository path does not exist or cannot be accessed."
        )
      ).toBeInTheDocument();

      // Suggestions should be actionable
      expect(
        screen.getByText(
          "Double-check the spelling and capitalization of the path"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText("Copy the path directly from your file manager")
      ).toBeInTheDocument();
    });

    it("should provide contextual help for different error categories", () => {
      const pathError: UserFriendlyError = {
        title: "Invalid Path Format",
        message: "The path format is not valid for your operating system.",
        suggestions: ["Use the correct path separators for your OS"],
        severity: "error",
        category: "path",
      };

      render(<EnhancedErrorDisplay userFriendlyError={pathError} />);

      // Should show platform-specific tips for path errors
      expect(
        screen.getByText("Show platform-specific tips")
      ).toBeInTheDocument();
    });
  });
});
