/**
 * Basic unit tests for PathInput component
 * Tests core functionality without complex user interactions
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  mockFunction,
  setupMocks,
  cleanupMocks,
} from "../../../../../tests/MockManager";
import PathInput from "../common/PathInput";

describe("PathInput Basic Tests", () => {
  const mockOnChange = mockFunction();

  beforeEach(() => {
    setupMocks();
    mockOnChange.mockReset?.();
  });

  afterEach(() => {
    cleanupMocks();
  });

  it("should render with basic props", () => {
    render(<PathInput label="Test Path" value="" onChange={mockOnChange} />);

    expect(screen.getByLabelText("Test Path")).toBeInTheDocument();
  });

  it("should show required indicator when required", () => {
    render(
      <PathInput
        label="Required Path"
        value=""
        onChange={mockOnChange}
        required={true}
      />
    );

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("should display the current value", () => {
    render(
      <PathInput
        label="Test Path"
        value="C:\\test\\path"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText("Test Path") as HTMLInputElement;
    expect(input.value).toBe("C:\\test\\path");
  });

  it("should show format help button when showFormatHints is true", () => {
    render(
      <PathInput
        label="Test Path"
        value=""
        onChange={mockOnChange}
        showFormatHints={true}
      />
    );

    expect(screen.getByText("Format Help")).toBeInTheDocument();
  });

  it("should show validate button when validateOnChange is false", () => {
    render(
      <PathInput
        label="Test Path"
        value=""
        onChange={mockOnChange}
        validateOnChange={false}
      />
    );

    expect(screen.getByText("Validate Path")).toBeInTheDocument();
  });

  it("should show browse button", () => {
    render(<PathInput label="Test Path" value="" onChange={mockOnChange} />);

    expect(screen.getByRole("button", { name: /browse/i })).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(
      <PathInput
        label="Repository Path"
        value=""
        onChange={mockOnChange}
        required={true}
      />
    );

    const input = screen.getByLabelText("Repository Path");
    expect(input).toHaveAttribute("id");
    expect(input).toBeRequired();
  });
});
