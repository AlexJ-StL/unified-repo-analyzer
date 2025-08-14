/**
 * Integration tests for PathInput component with real-time validation
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { pathValidationService } from "../../services/pathValidation";
import PathInput from "../common/PathInput";

// Mock the path validation service
vi.mock("../../services/pathValidation", () => ({
  pathValidationService: {
    validatePath: vi.fn(),
    getPathFormatHints: vi.fn(() => ({
      platform: "Windows",
      examples: [
        "C:\\Users\\Username\\Documents\\MyProject",
        "C:/Users/Username/Documents/MyProject",
      ],
      tips: [
        "Use either forward slashes (/) or backslashes (\\)",
        "Drive letters should be followed by a colon (C:)",
      ],
    })),
    normalizePathForDisplay: vi.fn((path: string) => path),
    isPathFormatValid: vi.fn(() => ({ isValid: true, errors: [] })),
  },
}));

describe("PathInput Integration Tests", () => {
  const mockOnChange = vi.fn();
  const mockOnValidationChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Real-time Validation", () => {
    it("should validate path on input change with debouncing", async () => {
      const user = userEvent.setup();

      // Mock successful validation
      vi.mocked(pathValidationService.validatePath).mockResolvedValue({
        isValid: true,
        normalizedPath: "C:\\Users\\Test\\Documents",
        errors: [],
        warnings: [],
        metadata: {
          exists: true,
          isDirectory: true,
          permissions: { read: true, write: true, execute: true },
        },
      });

      render(
        <PathInput
          label="Test Path"
          value=""
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          validateOnChange={true}
        />
      );

      const input = screen.getByLabelText("Test Path");

      // Type a path
      await user.type(input, "C:\\Users\\Test\\Documents");

      // Should call onChange for each character
      expect(mockOnChange).toHaveBeenCalledTimes(26); // Length of the path

      // Should debounce validation calls
      await waitFor(
        () => {
          expect(pathValidationService.validatePath).toHaveBeenCalledWith(
            "C:\\Users\\Test\\Documents",
            expect.any(Object),
            expect.any(Function)
          );
        },
        { timeout: 1000 }
      );

      // Should call validation change callback
      await waitFor(() => {
        expect(mockOnValidationChange).toHaveBeenCalledWith(
          true,
          expect.objectContaining({
            isValid: true,
            normalizedPath: "C:\\Users\\Test\\Documents",
          })
        );
      });
    });

    it("should show validation errors for invalid paths", async () => {
      const user = userEvent.setup();

      // Mock validation failure
      vi.mocked(pathValidationService.validatePath).mockResolvedValue({
        isValid: false,
        errors: [
          {
            code: "PATH_NOT_FOUND",
            message: "The specified path does not exist",
            suggestions: ["Check if the path is spelled correctly"],
          },
        ],
        warnings: [],
        metadata: {
          exists: false,
          isDirectory: false,
          permissions: { read: false, write: false, execute: false },
        },
      });

      render(
        <PathInput
          label="Test Path"
          value=""
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          validateOnChange={true}
        />
      );

      const input = screen.getByLabelText("Test Path");

      // Type an invalid path
      await user.type(input, "C:\\NonExistent\\Path");

      // Wait for validation to complete
      await waitFor(() => {
        expect(screen.getByText(/Path validation failed/i)).toBeInTheDocument();
      });

      // Should show error details
      expect(screen.getByText(/PATH_NOT_FOUND/i)).toBeInTheDocument();
      expect(
        screen.getByText(/The specified path does not exist/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Check if the path is spelled correctly/i)
      ).toBeInTheDocument();

      // Should call validation change callback with error
      expect(mockOnValidationChange).toHaveBeenCalledWith(
        false,
        expect.objectContaining({
          isValid: false,
          errors: expect.arrayContaining([
            expect.objectContaining({
              code: "PATH_NOT_FOUND",
            }),
          ]),
        })
      );
    });

    it("should show loading state during validation", async () => {
      const user = userEvent.setup();

      // Mock slow validation
      let resolveValidation: (value: any) => void;
      const validationPromise = new Promise((resolve) => {
        resolveValidation = resolve;
      });
      vi.mocked(pathValidationService.validatePath).mockReturnValue(
        validationPromise
      );

      render(
        <PathInput
          label="Test Path"
          value=""
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          validateOnChange={true}
        />
      );

      const input = screen.getByLabelText("Test Path");

      // Type a path
      await user.type(input, "C:\\Users\\Test");

      // Should show loading state
      await waitFor(() => {
        expect(
          screen.getByText(/Starting path validation/i)
        ).toBeInTheDocument();
      });

      // Resolve validation
      resolveValidation!({
        isValid: true,
        normalizedPath: "C:\\Users\\Test",
        errors: [],
        warnings: [],
        metadata: {
          exists: true,
          isDirectory: true,
          permissions: { read: true, write: true, execute: true },
        },
      });

      // Loading state should disappear
      await waitFor(() => {
        expect(
          screen.queryByText(/Starting path validation/i)
        ).not.toBeInTheDocument();
      });
    });

    it("should handle validation timeout", async () => {
      const user = userEvent.setup();

      // Mock timeout error
      vi.mocked(pathValidationService.validatePath).mockRejectedValue(
        new Error("Timeout")
      );

      render(
        <PathInput
          label="Test Path"
          value=""
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          validateOnChange={true}
          timeoutMs={1000}
        />
      );

      const input = screen.getByLabelText("Test Path");

      // Type a path
      await user.type(input, "C:\\SlowPath");

      // Should show timeout error
      await waitFor(() => {
        expect(screen.getByText(/Path validation failed/i)).toBeInTheDocument();
      });

      // Should call validation change callback with error
      expect(mockOnValidationChange).toHaveBeenCalledWith(
        false,
        expect.objectContaining({
          isValid: false,
          errors: expect.arrayContaining([
            expect.objectContaining({
              code: "VALIDATION_ERROR",
            }),
          ]),
        })
      );
    });
  });

  describe("Format Hints", () => {
    it("should show format hints when requested", async () => {
      const user = userEvent.setup();

      render(
        <PathInput
          label="Test Path"
          value=""
          onChange={mockOnChange}
          showFormatHints={true}
        />
      );

      // Click format help button
      const formatHelpButton = screen.getByText(/Format Help/i);
      await user.click(formatHelpButton);

      // Should show format hints
      expect(screen.getByText(/Windows Path Format/i)).toBeInTheDocument();
      expect(
        screen.getByText(/C:\\Users\\Username\\Documents\\MyProject/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Use either forward slashes/i)
      ).toBeInTheDocument();
    });

    it("should hide format hints when toggled", async () => {
      const user = userEvent.setup();

      render(
        <PathInput
          label="Test Path"
          value=""
          onChange={mockOnChange}
          showFormatHints={true}
        />
      );

      // Click format help button to show
      const formatHelpButton = screen.getByText(/Format Help/i);
      await user.click(formatHelpButton);

      expect(screen.getByText(/Windows Path Format/i)).toBeInTheDocument();

      // Click again to hide
      await user.click(formatHelpButton);

      expect(
        screen.queryByText(/Windows Path Format/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Windows-specific Path Handling", () => {
    it("should handle Windows backslash paths", async () => {
      const user = userEvent.setup();

      vi.mocked(pathValidationService.validatePath).mockResolvedValue({
        isValid: true,
        normalizedPath: "C:\\Users\\Test\\Documents",
        errors: [],
        warnings: [],
        metadata: {
          exists: true,
          isDirectory: true,
          permissions: { read: true, write: true, execute: true },
        },
      });

      render(
        <PathInput
          label="Test Path"
          value=""
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          validateOnChange={true}
        />
      );

      const input = screen.getByLabelText("Test Path");

      // Type Windows path with backslashes
      await user.type(input, "C:\\Users\\Test\\Documents");

      await waitFor(() => {
        expect(pathValidationService.validatePath).toHaveBeenCalledWith(
          "C:\\Users\\Test\\Documents",
          expect.any(Object),
          expect.any(Function)
        );
      });

      // Should show success state
      await waitFor(() => {
        expect(screen.getByText(/Path is valid/i)).toBeInTheDocument();
      });
    });

    it("should handle Windows forward slash paths", async () => {
      const user = userEvent.setup();

      vi.mocked(pathValidationService.validatePath).mockResolvedValue({
        isValid: true,
        normalizedPath: "C:\\Users\\Test\\Documents",
        errors: [],
        warnings: [],
        metadata: {
          exists: true,
          isDirectory: true,
          permissions: { read: true, write: true, execute: true },
        },
      });

      render(
        <PathInput
          label="Test Path"
          value=""
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          validateOnChange={true}
        />
      );

      const input = screen.getByLabelText("Test Path");

      // Type Windows path with forward slashes
      await user.type(input, "C:/Users/Test/Documents");

      await waitFor(() => {
        expect(pathValidationService.validatePath).toHaveBeenCalledWith(
          "C:/Users/Test/Documents",
          expect.any(Object),
          expect.any(Function)
        );
      });

      // Should show success state with normalized path
      await waitFor(() => {
        expect(screen.getByText(/Path is valid/i)).toBeInTheDocument();
        expect(
          screen.getByText(/normalized: C:\\Users\\Test\\Documents/i)
        ).toBeInTheDocument();
      });
    });

    it("should handle UNC paths", async () => {
      const user = userEvent.setup();

      vi.mocked(pathValidationService.validatePath).mockResolvedValue({
        isValid: false,
        errors: [
          {
            code: "NETWORK_ERROR",
            message: "Unable to access network location",
            suggestions: [
              "Check network connectivity",
              "Verify server is accessible",
            ],
          },
        ],
        warnings: [],
        metadata: {
          exists: false,
          isDirectory: false,
          permissions: { read: false, write: false, execute: false },
        },
      });

      render(
        <PathInput
          label="Test Path"
          value=""
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          validateOnChange={true}
        />
      );

      const input = screen.getByLabelText("Test Path");

      // Type UNC path
      await user.type(input, "\\\\server\\share\\folder");

      await waitFor(() => {
        expect(pathValidationService.validatePath).toHaveBeenCalledWith(
          "\\\\server\\share\\folder",
          expect.any(Object),
          expect.any(Function)
        );
      });

      // Should show network error
      await waitFor(() => {
        expect(screen.getByText(/Path validation failed/i)).toBeInTheDocument();
        expect(screen.getByText(/NETWORK_ERROR/i)).toBeInTheDocument();
        expect(
          screen.getByText(/Check network connectivity/i)
        ).toBeInTheDocument();
      });
    });

    it("should detect reserved names", async () => {
      const user = userEvent.setup();

      vi.mocked(pathValidationService.validatePath).mockResolvedValue({
        isValid: false,
        errors: [
          {
            code: "RESERVED_NAME",
            message: "Path contains Windows reserved name: CON",
            suggestions: [
              "Rename the file or directory to avoid reserved names",
            ],
          },
        ],
        warnings: [],
        metadata: {
          exists: false,
          isDirectory: false,
          permissions: { read: false, write: false, execute: false },
        },
      });

      render(
        <PathInput
          label="Test Path"
          value=""
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          validateOnChange={true}
        />
      );

      const input = screen.getByLabelText("Test Path");

      // Type path with reserved name
      await user.type(input, "C:\\Users\\CON\\Documents");

      await waitFor(() => {
        expect(screen.getByText(/Path validation failed/i)).toBeInTheDocument();
        expect(screen.getByText(/RESERVED_NAME/i)).toBeInTheDocument();
        expect(
          screen.getByText(/Path contains Windows reserved name: CON/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("User Experience", () => {
    it("should provide visual feedback for validation states", async () => {
      const user = userEvent.setup();

      render(
        <PathInput
          label="Test Path"
          value=""
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          validateOnChange={true}
        />
      );

      const input = screen.getByLabelText("Test Path");

      // Initially should have default styling
      expect(input).toHaveClass("border-gray-300");

      // Mock validation in progress
      let resolveValidation: (value: any) => void;
      const validationPromise = new Promise((resolve) => {
        resolveValidation = resolve;
      });
      vi.mocked(pathValidationService.validatePath).mockReturnValue(
        validationPromise
      );

      // Type to trigger validation
      await user.type(input, "C:\\Test");

      // Should show validating state
      await waitFor(() => {
        expect(input).toHaveClass("border-yellow-300");
      });

      // Resolve with success
      resolveValidation!({
        isValid: true,
        normalizedPath: "C:\\Test",
        errors: [],
        warnings: [],
        metadata: {
          exists: true,
          isDirectory: true,
          permissions: { read: true, write: true, execute: true },
        },
      });

      // Should show success state
      await waitFor(() => {
        expect(input).toHaveClass("border-green-300");
      });
    });

    it("should show error state for invalid paths", async () => {
      const user = userEvent.setup();

      vi.mocked(pathValidationService.validatePath).mockResolvedValue({
        isValid: false,
        errors: [{ code: "PATH_NOT_FOUND", message: "Path not found" }],
        warnings: [],
        metadata: {
          exists: false,
          isDirectory: false,
          permissions: { read: false, write: false, execute: false },
        },
      });

      render(
        <PathInput
          label="Test Path"
          value=""
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          validateOnChange={true}
        />
      );

      const input = screen.getByLabelText("Test Path");

      await user.type(input, "C:\\Invalid");

      // Should show error state
      await waitFor(() => {
        expect(input).toHaveClass("border-red-300");
      });
    });

    it("should disable validation when validateOnChange is false", async () => {
      const user = userEvent.setup();

      render(
        <PathInput
          label="Test Path"
          value=""
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          validateOnChange={false}
        />
      );

      const input = screen.getByLabelText("Test Path");

      await user.type(input, "C:\\Test");

      // Should not trigger automatic validation
      expect(pathValidationService.validatePath).not.toHaveBeenCalled();

      // Should show manual validation button
      expect(screen.getByText(/Validate Path/i)).toBeInTheDocument();
    });

    it("should trigger manual validation when button is clicked", async () => {
      const user = userEvent.setup();

      vi.mocked(pathValidationService.validatePath).mockResolvedValue({
        isValid: true,
        normalizedPath: "C:\\Test",
        errors: [],
        warnings: [],
        metadata: {
          exists: true,
          isDirectory: true,
          permissions: { read: true, write: true, execute: true },
        },
      });

      render(
        <PathInput
          label="Test Path"
          value="C:\\Test"
          onChange={mockOnChange}
          onValidationChange={mockOnValidationChange}
          validateOnChange={false}
        />
      );

      const validateButton = screen.getByText(/Validate Path/i);
      await user.click(validateButton);

      expect(pathValidationService.validatePath).toHaveBeenCalledWith(
        "C:\\Test",
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels and descriptions", () => {
      render(
        <PathInput
          label="Repository Path"
          value=""
          onChange={mockOnChange}
          required={true}
        />
      );

      const input = screen.getByLabelText(/Repository Path/i);
      expect(input).toHaveAttribute("id");
      expect(input).toBeRequired();

      // Should have required indicator
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();

      render(
        <PathInput
          label="Test Path"
          value=""
          onChange={mockOnChange}
          showFormatHints={true}
        />
      );

      // Should be able to tab to input
      await user.tab();
      expect(screen.getByLabelText("Test Path")).toHaveFocus();

      // Should be able to tab to format help button
      await user.tab();
      expect(screen.getByText(/Format Help/i)).toHaveFocus();

      // Should be able to tab to browse button
      await user.tab();
      expect(screen.getByRole("button", { name: /browse/i })).toHaveFocus();
    });
  });
});
