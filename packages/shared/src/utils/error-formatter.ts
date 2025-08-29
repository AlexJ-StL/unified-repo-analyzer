import { platform } from "node:os";

import {
  type ClassifiedError,
  ErrorCode,
  type ErrorResponse,
  ErrorSeverity,
  type ErrorSuggestion,
} from "../types/error-classification.js";

/**
 * Error response formatting utilities for unified-repo-analyzer
 * Provides consistent error formatting across the application
 * Requirements: 3.3, 4.5, 5.5
 */

/**
 * Error formatting options
 */
export interface ErrorFormattingOptions {
  includeStack?: boolean;
  includeContext?: boolean;
  includeSuggestions?: boolean;
  includeLearnMore?: boolean;
  maxSuggestions?: number;
  platformSpecific?: boolean;
}

/**
 * Console formatting options
 */
export interface ConsoleFormattingOptions extends ErrorFormattingOptions {
  useColors?: boolean;
  indentSize?: number;
  maxWidth?: number;
}

/**
 * Error response formatter utility class
 */
export class ErrorFormatter {
  private static instance: ErrorFormatter;
  private readonly currentPlatform: string;

  // ANSI color codes for console output
  private readonly colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m",
  };

  constructor() {
    this.currentPlatform = platform();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorFormatter {
    if (!ErrorFormatter.instance) {
      ErrorFormatter.instance = new ErrorFormatter();
    }
    return ErrorFormatter.instance;
  }

  /**
   * Format error for API response
   */
  public formatForAPI(
    error: ClassifiedError,
    options: ErrorFormattingOptions = {}
  ): ErrorResponse {
    const defaultOptions: ErrorFormattingOptions = {
      includeStack: false,
      includeContext: false,
      includeSuggestions: true,
      includeLearnMore: true,
      maxSuggestions: 5,
      platformSpecific: true,
    };

    const opts = { ...defaultOptions, ...options };

    // Filter suggestions based on platform and limit
    let suggestions = error.suggestions;
    if (opts.platformSpecific) {
      suggestions = this.filterPlatformSpecificSuggestions(suggestions);
    }
    if (opts.maxSuggestions && suggestions.length > opts.maxSuggestions) {
      suggestions = suggestions.slice(0, opts.maxSuggestions);
    }

    const response: ErrorResponse = {
      error: {
        id: error.id,
        code: error.code,
        category: error.category,
        severity: error.severity,
        message: error.message,
        details: error.details,
        suggestions: opts.includeSuggestions ? suggestions : [],
        correlationId: error.correlationId,
        timestamp: error.timestamp.toISOString(),
        context: opts.includeContext
          ? this.sanitizeContext(error.context)
          : undefined,
      },
      requestId: error.context.requestId,
      path: error.context.path,
    };

    // Add learn more URL if requested
    if (opts.includeLearnMore && error.learnMoreUrl) {
      (response.error as any).learnMoreUrl = error.learnMoreUrl;
    }

    return response;
  }

  /**
   * Format error for console output
   */
  public formatForConsole(
    error: ClassifiedError,
    options: ConsoleFormattingOptions = {}
  ): string {
    const defaultOptions: ConsoleFormattingOptions = {
      useColors: true,
      includeStack: false,
      includeContext: true,
      includeSuggestions: true,
      includeLearnMore: true,
      maxSuggestions: 3,
      platformSpecific: true,
      indentSize: 2,
      maxWidth: 80,
    };

    const opts = {
      ...defaultOptions,
      ...options,
    };
    const indent = " ".repeat(opts.indentSize || 2);
    const lines: string[] = [];

    // Header with severity indicator
    const severityIcon = this.getSeverityIcon(error.severity);
    const severityColor = this.getSeverityColor(error.severity);
    const title = opts.useColors
      ? `${severityColor}${this.colors.bright}${severityIcon} ${error.title}${this.colors.reset}`
      : `${severityIcon} ${error.title}`;

    lines.push(title);
    lines.push("");

    // Error details
    lines.push(
      `${this.colorize("Error ID:", this.colors.gray, opts.useColors)} ${error.id}`
    );
    lines.push(
      `${this.colorize("Code:", this.colors.gray, opts.useColors)} ${error.code}`
    );
    lines.push(
      `${this.colorize("Category:", this.colors.gray, opts.useColors)} ${error.category}`
    );
    lines.push(
      `${this.colorize("Severity:", this.colors.gray, opts.useColors)} ${error.severity}`
    );
    lines.push(
      `${this.colorize("Time:", this.colors.gray, opts.useColors)} ${error.timestamp.toISOString()}`
    );

    if (error.context.path) {
      lines.push(
        `${this.colorize("Path:", this.colors.gray, opts.useColors)} ${error.context.path}`
      );
    }

    lines.push("");

    // Message
    lines.push(this.colorize("Message:", this.colors.blue, opts.useColors));
    lines.push(this.wrapText(error.message, opts.maxWidth || 80, indent));

    if (error.details) {
      lines.push("");
      lines.push(this.colorize("Details:", this.colors.blue, opts.useColors));
      lines.push(this.wrapText(error.details, opts.maxWidth || 80, indent));
    }

    // Context information
    if (opts.includeContext && this.hasRelevantContext(error.context)) {
      lines.push("");
      lines.push(this.colorize("Context:", this.colors.cyan, opts.useColors));
      lines.push(...this.formatContextForConsole(error.context, indent, opts));
    }

    // Suggestions
    if (opts.includeSuggestions && error.suggestions.length > 0) {
      lines.push("");
      lines.push(
        this.colorize(
          "💡 Suggested Actions:",
          this.colors.yellow,
          opts.useColors
        )
      );

      let suggestions = error.suggestions;
      if (opts.platformSpecific) {
        suggestions = this.filterPlatformSpecificSuggestions(suggestions);
      }
      if (opts.maxSuggestions && suggestions.length > opts.maxSuggestions) {
        suggestions = suggestions.slice(0, opts.maxSuggestions);
      }

      suggestions.forEach((suggestion, index) => {
        const priority = suggestion.priority ? ` (${suggestion.priority})` : "";
        const actionText = `${index + 1}. ${suggestion.action}${priority}`;
        lines.push(
          this.colorize(actionText, this.colors.yellow, opts.useColors)
        );
        lines.push(
          this.wrapText(
            suggestion.description,
            opts.maxWidth || 80,
            `${indent}   `
          )
        );

        if (suggestion.command) {
          const commandText = `Command: ${suggestion.command}`;
          lines.push(
            this.colorize(
              `${indent}   ${commandText}`,
              this.colors.cyan,
              opts.useColors
            )
          );
        }

        if (index < suggestions.length - 1) {
          lines.push("");
        }
      });
    }

    // Learn more URL
    if (opts.includeLearnMore && error.learnMoreUrl) {
      lines.push("");
      lines.push(
        `${this.colorize("📖 Learn More:", this.colors.blue, opts.useColors)} ${error.learnMoreUrl}`
      );
    }

    // Stack trace (if requested and available)
    if (opts.includeStack && error.stack) {
      lines.push("");
      lines.push(
        this.colorize("Stack Trace:", this.colors.gray, opts.useColors)
      );
      const stackLines = error.stack.split("\n").map((line) => indent + line);
      lines.push(...stackLines);
    }

    // Footer
    lines.push("");
    lines.push(
      this.colorize(
        "─".repeat(opts.maxWidth || 80),
        this.colors.gray,
        opts.useColors
      )
    );

    return lines.join("\n");
  }

  /**
   * Format error for logging
   */
  public formatForLogging(error: ClassifiedError): Record<string, any> {
    return {
      errorId: error.id,
      code: error.code,
      category: error.category,
      severity: error.severity,
      title: error.title,
      message: error.message,
      details: error.details,
      correlationId: error.correlationId,
      timestamp: error.timestamp.toISOString(),
      context: this.sanitizeContext(error.context),
      suggestions: error.suggestions.map((s) => ({
        action: s.action,
        description: s.description,
        priority: s.priority,
        platform: s.platform,
      })),
      stack: error.stack,
      resolved: error.resolved,
      resolvedAt: error.resolvedAt?.toISOString(),
      resolution: error.resolution,
    };
  }

  /**
   * Format multiple errors as a summary
   */
  public formatErrorSummary(
    errors: ClassifiedError[],
    options: ConsoleFormattingOptions = {}
  ): string {
    if (errors.length === 0) {
      return "No errors to display.";
    }

    const opts = { ...options, useColors: options.useColors ?? true };
    const lines: string[] = [];

    // Summary header
    const headerText = `Error Summary (${errors.length} error${errors.length === 1 ? "" : "s"})`;
    lines.push(this.colorize(headerText, this.colors.bright, opts.useColors));
    lines.push(
      this.colorize(
        "=".repeat(headerText.length),
        this.colors.gray,
        opts.useColors
      )
    );
    lines.push("");

    // Group errors by severity
    const errorsBySeverity = this.groupErrorsBySeverity(errors);

    Object.entries(errorsBySeverity).forEach(([severity, severityErrors]) => {
      if (severityErrors.length === 0) return;

      const severityColor = this.getSeverityColor(severity as ErrorSeverity);
      const severityIcon = this.getSeverityIcon(severity as ErrorSeverity);
      const severityHeader = `${severityIcon} ${severity} (${severityErrors.length})`;

      lines.push(this.colorize(severityHeader, severityColor, opts.useColors));
      lines.push("");

      severityErrors.forEach((error, index) => {
        const prefix = `  ${index + 1}. `;
        const errorLine = `${error.title} (${error.code})`;
        lines.push(prefix + errorLine);

        if (error.context.path) {
          lines.push(`     Path: ${error.context.path}`);
        }

        lines.push(`     Time: ${error.timestamp.toLocaleString()}`);
        lines.push("");
      });
    });

    return lines.join("\n");
  }

  /**
   * Create a user-friendly error message for specific error types
   */
  public createUserFriendlyMessage(error: ClassifiedError): string {
    const messageTemplates: Partial<Record<ErrorCode, string>> = {
      [ErrorCode.PATH_NOT_FOUND]: `We couldn't find the repository at "${error.context.path}". Please check that the path exists and try again.`,
      [ErrorCode.PATH_INVALID_FORMAT]: `The path "${error.context.path}" has an invalid format. Please use the correct format for your operating system.`,
      [ErrorCode.PERMISSION_READ_DENIED]: `You don't have permission to read from "${error.context.path}". Please check the folder permissions.`,
      [ErrorCode.NETWORK_TIMEOUT]:
        "The network request timed out. Please check your connection and try again.",
      [ErrorCode.LLM_PROVIDER_QUOTA_EXCEEDED]: `You've reached your API quota limit. Please check your usage or upgrade your plan.`,
    };

    return messageTemplates[error.code] || error.message;
  }

  /**
   * Filter suggestions based on current platform
   */
  private filterPlatformSpecificSuggestions(
    suggestions: ErrorSuggestion[]
  ): ErrorSuggestion[] {
    const platformMap: Record<string, string> = {
      win32: "windows",
      darwin: "macos",
      linux: "linux",
    };

    const currentPlatformKey = platformMap[this.currentPlatform] || "all";

    return suggestions.filter(
      (suggestion) =>
        !suggestion.platform ||
        suggestion.platform === "all" ||
        suggestion.platform === currentPlatformKey
    );
  }

  /**
   * Sanitize context for output (remove sensitive information)
   */
  private sanitizeContext(context: any): any {
    const sensitiveKeys = [
      "userId",
      "sessionId",
      "apiKey",
      "token",
      "password",
    ];
    const sanitized = { ...context };

    sensitiveKeys.forEach((key) => {
      if (sanitized[key]) {
        sanitized[key] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  /**
   * Get severity icon
   */
  private getSeverityIcon(severity: ErrorSeverity): string {
    const icons: Record<ErrorSeverity, string> = {
      [ErrorSeverity.CRITICAL]: "🔴",
      [ErrorSeverity.HIGH]: "🟠",
      [ErrorSeverity.MEDIUM]: "🟡",
      [ErrorSeverity.LOW]: "🔵",
    };

    return icons[severity] || "⚪";
  }

  /**
   * Get severity color
   */
  private getSeverityColor(severity: ErrorSeverity): string {
    const colors: Record<ErrorSeverity, string> = {
      [ErrorSeverity.CRITICAL]: this.colors.red,
      [ErrorSeverity.HIGH]: this.colors.red,
      [ErrorSeverity.MEDIUM]: this.colors.yellow,
      [ErrorSeverity.LOW]: this.colors.blue,
    };

    return colors[severity] || this.colors.white;
  }

  /**
   * Colorize text for console output
   */
  private colorize(text: string, color: string, useColors?: boolean): string {
    return (useColors ?? true) ? `${color}${text}${this.colors.reset}` : text;
  }

  /**
   * Wrap text to specified width
   */
  private wrapText(text: string, maxWidth: number, indent = ""): string {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = indent;

    words.forEach((word) => {
      if (currentLine.length + word.length + 1 > maxWidth) {
        lines.push(currentLine);
        currentLine = indent + word;
      } else {
        currentLine += (currentLine === indent ? "" : " ") + word;
      }
    });

    if (currentLine.length > indent.length) {
      lines.push(currentLine);
    }

    return lines.join("\n");
  }

  /**
   * Check if context has relevant information to display
   */
  private hasRelevantContext(context: any): boolean {
    const relevantKeys = [
      "platform",
      "nodeVersion",
      "method",
      "url",
      "statusCode",
      "duration",
      "provider",
    ];
    return relevantKeys.some((key) => context[key] !== undefined);
  }

  /**
   * Format context for console display
   */
  private formatContextForConsole(
    context: any,
    indent: string,
    _options: ConsoleFormattingOptions
  ): string[] {
    const lines: string[] = [];
    const sanitized = this.sanitizeContext(context);

    // Display relevant context information
    if (sanitized.platform) {
      lines.push(`${indent}Platform: ${sanitized.platform}`);
    }
    if (sanitized.nodeVersion) {
      lines.push(`${indent}Node.js: ${sanitized.nodeVersion}`);
    }
    if (sanitized.method && sanitized.url) {
      lines.push(`${indent}Request: ${sanitized.method} ${sanitized.url}`);
    }
    if (sanitized.statusCode) {
      lines.push(`${indent}Status: ${sanitized.statusCode}`);
    }
    if (sanitized.duration) {
      lines.push(`${indent}Duration: ${sanitized.duration}ms`);
    }
    if (sanitized.provider) {
      lines.push(`${indent}Provider: ${sanitized.provider}`);
    }

    return lines;
  }

  /**
   * Group errors by severity
   */
  private groupErrorsBySeverity(
    errors: ClassifiedError[]
  ): Record<ErrorSeverity, ClassifiedError[]> {
    const grouped: Record<ErrorSeverity, ClassifiedError[]> = {
      [ErrorSeverity.CRITICAL]: [],
      [ErrorSeverity.HIGH]: [],
      [ErrorSeverity.MEDIUM]: [],
      [ErrorSeverity.LOW]: [],
    };

    errors.forEach((error) => {
      grouped[error.severity].push(error);
    });

    return grouped;
  }
}

// Export singleton instance
export const errorFormatter = ErrorFormatter.getInstance();
export default errorFormatter;
