/**
 * Error message service for creating user-friendly error messages
 */

import type { PathError, PathWarning } from "./pathValidation";

export interface UserFriendlyError {
  title: string;
  message: string;
  details?: string;
  suggestions: string[];
  learnMoreUrl?: string;
  severity: "error" | "warning" | "info";
  category: "path" | "network" | "permission" | "system" | "validation";
}

/**
 * Error message templates for different error types
 */
const ERROR_TEMPLATES: Record<string, Partial<UserFriendlyError>> = {
  // Path-related errors
  PATH_NOT_FOUND: {
    title: "Repository Path Not Found",
    message:
      "The specified repository path does not exist or cannot be accessed.",
    suggestions: [
      "Double-check the spelling and capitalization of the path",
      "Navigate to the parent directory and verify the folder exists",
      "Copy the path directly from your file manager",
      "Ensure you have permission to access the directory",
      "Check if the folder was recently moved or renamed",
    ],
    severity: "error",
    category: "path",
    learnMoreUrl:
      "https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories",
  },

  PATH_INVALID_FORMAT: {
    title: "Invalid Path Format",
    message: "The path format is not valid for your operating system.",
    suggestions: [
      "Use the correct path separators for your OS (Windows: \\ or /, Unix: /)",
      "Check for invalid characters in the path",
      "Refer to the platform-specific format hints below",
      "Copy the path from your file manager to avoid typing errors",
    ],
    severity: "error",
    category: "path",
  },

  PATH_TOO_LONG: {
    title: "Path Too Long",
    message: "The path exceeds the maximum length allowed by your system.",
    suggestions: [
      "Move the repository closer to the root directory",
      "Use shorter directory names in the path",
      "Remove unnecessary nested directories",
      "Consider using symbolic links for deeply nested directories",
    ],
    severity: "error",
    category: "path",
    learnMoreUrl:
      "https://docs.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation",
  },

  RESERVED_NAME: {
    title: "Reserved Name in Path",
    message: "The path contains a name reserved by the operating system.",
    suggestions: [
      "Rename the folder to avoid reserved names like CON, PRN, AUX, NUL",
      "Avoid names like COM1-COM9 and LPT1-LPT9",
      'Add a prefix or suffix to the folder name (e.g., "my_con" instead of "con")',
      "Choose a different name that doesn't conflict with system reserved names",
    ],
    severity: "error",
    category: "path",
    learnMoreUrl:
      "https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file#naming-conventions",
  },

  INVALID_CHARACTERS: {
    title: "Invalid Characters in Path",
    message: "The path contains characters that are not allowed in file paths.",
    suggestions: [
      "Remove or replace invalid characters with underscores or hyphens",
      "Use only letters, numbers, underscores, and hyphens in folder names",
      "Avoid special characters and symbols",
      "Check for hidden or control characters",
    ],
    severity: "error",
    category: "path",
  },

  INVALID_DRIVE_LETTER: {
    title: "Invalid Drive Letter",
    message: "The path has an invalid drive letter format.",
    suggestions: [
      "Use a valid drive letter from A to Z followed by a colon (C:, D:, etc.)",
      "Include a backslash after the colon (C:\\, D:\\)",
      "Check if the drive exists and is accessible",
      "Try using a different drive letter if the current one is not available",
    ],
    severity: "error",
    category: "path",
  },

  INVALID_UNC_PATH: {
    title: "Invalid Network Path Format",
    message: "The network path has an invalid UNC format.",
    suggestions: [
      "Use the correct UNC format: \\\\server\\share\\folder",
      "Start with exactly two backslashes (\\\\)",
      "Include both server name and share name",
      "Test the path in Windows Explorer first",
    ],
    severity: "error",
    category: "network",
    learnMoreUrl:
      "https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file#unc",
  },

  NOT_DIRECTORY: {
    title: "Path is Not a Directory",
    message:
      "The path points to a file, but a directory is required for repository analysis.",
    suggestions: [
      "Select the repository folder, not a file within it",
      "Navigate to the parent directory if you selected a file",
      "Ensure you're pointing to the root of your repository",
      "Look for common repository files like README.md or .git folder",
    ],
    severity: "error",
    category: "path",
  },

  // Permission-related errors
  READ_PERMISSION_DENIED: {
    title: "Access Denied",
    message: "You do not have permission to read from this location.",
    suggestions: [
      "Verify you have the necessary permissions for the folder",
      "Try accessing the folder through your file manager first",
      "Copy the repository to a location you have full access to",
      "Contact your system administrator if it's a shared folder",
    ],
    severity: "error",
    category: "permission",
  },

  WRITE_PERMISSION_DENIED: {
    title: "Write Access Denied",
    message: "You do not have permission to write to this location.",
    suggestions: [
      "Choose a different location where you have write access",
      "Check if the storage device is write-protected",
      "Verify the folder is not marked as read-only",
      "Try copying the repository to your user directory",
    ],
    severity: "error",
    category: "permission",
  },

  SYSTEM_PATH_ACCESS: {
    title: "System Path Access Restricted",
    message: "Access to this system path is restricted for security reasons.",
    suggestions: [
      "Choose a repository in your user directory instead",
      "Avoid system directories like /System, /Windows, or /usr",
      "Use your Documents, Desktop, or Projects folder",
      "Contact your system administrator if you need access to this location",
    ],
    severity: "error",
    category: "permission",
  },

  READ_ONLY_FILE: {
    title: "Read-Only Directory",
    message: "The directory is marked as read-only and cannot be modified.",
    suggestions: [
      "Remove the read-only attribute from the directory",
      "Ensure you have permission to modify the directory",
      "Check if the storage device is write-protected",
      "Try copying the repository to a different location",
    ],
    severity: "error",
    category: "permission",
  },

  // Network-related errors
  NETWORK_ERROR: {
    title: "Network Connection Error",
    message: "A network error occurred while trying to access the path.",
    suggestions: [
      "Check your internet/network connection",
      "Verify the path is accessible from your current network",
      "Try accessing other network resources to test connectivity",
      "Wait a few moments and try again (temporary network issues)",
    ],
    severity: "error",
    category: "network",
  },

  UNC_PATH_INVALID: {
    title: "Network Path Not Accessible",
    message:
      "Cannot access the network path. The network location may be unavailable.",
    suggestions: [
      "Test your network connection to other resources",
      "Verify the server name is correct and the server is online",
      "Check the share name exists on the server",
      "Try accessing the path through your file explorer first",
      "Ensure you're connected to the correct network (VPN, corporate network)",
    ],
    severity: "error",
    category: "network",
  },

  // System-related errors
  TIMEOUT_ERROR: {
    title: "Operation Timed Out",
    message: "The path validation took too long to complete.",
    suggestions: [
      "Try with a path on a faster drive",
      "Check if the path is on a slow network drive",
      "Try accessing a subdirectory instead of the entire repository",
      "Ensure antivirus software is not scanning the directory",
    ],
    severity: "error",
    category: "system",
  },

  OPERATION_CANCELLED: {
    title: "Operation Cancelled",
    message: "The path validation was cancelled by the user.",
    suggestions: [
      "Try the operation again if it was cancelled unintentionally",
      "Ensure the path is accessible before retrying",
      "Allow more time for the validation to complete",
    ],
    severity: "info",
    category: "system",
  },

  // Validation errors
  INVALID_INPUT: {
    title: "Invalid Path Input",
    message: "The provided path is not valid input.",
    suggestions: [
      "Ensure the path is a non-empty string",
      "Check that the path contains valid characters",
      "Verify the path format is correct for your operating system",
      "Remove any leading or trailing whitespace from the path",
    ],
    severity: "error",
    category: "validation",
  },

  VALIDATION_ERROR: {
    title: "Path Validation Failed",
    message: "Unable to validate the path due to an unexpected error.",
    suggestions: [
      "Try a different path to test if the issue is path-specific",
      "Check your network connection if accessing a remote path",
      "Restart the application if the problem persists",
      "Contact support if you continue to experience issues",
    ],
    severity: "error",
    category: "validation",
  },

  // Security-related errors
  NULL_BYTE_IN_PATH: {
    title: "Invalid Path - Security Risk",
    message:
      "The path contains null bytes, which is a potential security vulnerability.",
    suggestions: [
      "Remove any null bytes (\\0) from the path",
      "Ensure the path comes from a trusted source",
      "Validate input before using it as a file path",
      "Contact support if you believe this is an error",
    ],
    severity: "error",
    category: "validation",
  },

  CONTROL_CHARACTERS: {
    title: "Invalid Control Characters in Path",
    message:
      "The path contains control characters that are not allowed in file paths.",
    suggestions: [
      "Remove any control characters (ASCII 0-31) from the path",
      "Use only printable characters in file and folder names",
      "Copy the path from your file manager to avoid invisible characters",
      "Check for hidden characters if the path appears normal",
    ],
    severity: "error",
    category: "validation",
  },

  INVALID_COMPONENT_ENDING: {
    title: "Invalid Path Component",
    message:
      "The path contains a folder or file name that ends with a space or dot.",
    suggestions: [
      "Remove trailing spaces and dots from folder names",
      "Use underscores or hyphens instead of trailing spaces",
      "Rename folders to remove trailing whitespace",
      "Check folder names in your file manager",
    ],
    severity: "error",
    category: "path",
  },

  // Permission checking errors
  PERMISSION_CHECK_ERROR: {
    title: "Permission Check Failed",
    message: "Unable to check file permissions due to a system error.",
    suggestions: [
      "Try accessing the path through your file manager first",
      "Check if the path exists and is accessible",
      "Ensure you have sufficient privileges to check permissions",
      "Try again in a moment as this may be a temporary issue",
    ],
    severity: "error",
    category: "permission",
  },

  OWNERSHIP_INFO_ERROR: {
    title: "File Ownership Information Unavailable",
    message: "Could not retrieve file ownership information.",
    suggestions: [
      "This may not affect your ability to use the path",
      "Check if you have permission to access file properties",
      "Try accessing the path directly to test functionality",
      "Contact your system administrator if this persists",
    ],
    severity: "warning",
    category: "permission",
  },

  WINDOWS_PERMISSION_CHECK_ERROR: {
    title: "Windows Permission Check Failed",
    message: "Windows-specific permission validation encountered an error.",
    suggestions: [
      "Try running the application as Administrator",
      "Check Windows Security settings for the path",
      "Ensure the path is not blocked by antivirus software",
      "Try accessing the path through Windows Explorer first",
    ],
    severity: "error",
    category: "permission",
  },

  // File system errors
  FILESYSTEM_ERROR: {
    title: "File System Error",
    message: "A file system error occurred while accessing the path.",
    suggestions: [
      "Check if the storage device is properly connected",
      "Verify the file system is not corrupted",
      "Try accessing other files on the same drive",
      "Run a disk check utility if problems persist",
    ],
    severity: "error",
    category: "system",
  },

  // Access denied variations
  ACCESS_DENIED: {
    title: "Access Denied",
    message: "You do not have sufficient permissions to access this path.",
    suggestions: [
      "Check if you have the necessary permissions",
      "Try running the application with elevated privileges",
      "Ensure the path is not restricted by security policies",
      "Contact your system administrator if needed",
    ],
    severity: "error",
    category: "permission",
  },
};

/**
 * Warning message templates
 */
const WARNING_TEMPLATES: Record<string, Partial<UserFriendlyError>> = {
  PATH_LENGTH_WARNING: {
    title: "Long Path Warning",
    message: "This path is quite long and may cause issues on some systems.",
    suggestions: [
      "Consider using shorter directory names",
      "This may work but could cause problems later",
    ],
    severity: "warning",
    category: "path",
  },

  COMPONENT_TOO_LONG: {
    title: "Long Directory Name",
    message: "One or more directory names in the path are very long.",
    suggestions: [
      "Consider shortening directory names",
      "This may work but could cause compatibility issues",
    ],
    severity: "warning",
    category: "path",
  },

  CASE_SENSITIVITY_WARNING: {
    title: "Case Sensitivity Notice",
    message: "Path case may matter on some file systems.",
    suggestions: [
      "Ensure the case matches exactly",
      "This is more important on Unix-like systems",
    ],
    severity: "warning",
    category: "path",
  },

  VERY_LONG_PATH: {
    title: "Very Long Path Warning",
    message: "This path is extremely long and may cause compatibility issues.",
    suggestions: [
      "Consider shortening the path structure",
      "Move files closer to the root directory",
      "This may work but could cause problems on some systems",
      "Test thoroughly if you must use this path length",
    ],
    severity: "warning",
    category: "path",
  },
};

/**
 * Error message service class
 */
class ErrorMessageService {
  /**
   * Create a user-friendly error message from path errors
   */
  createPathErrorMessage(
    errors: PathError[],
    warnings: PathWarning[] = [],
    originalPath?: string
  ): UserFriendlyError {
    if (errors.length === 0) {
      return {
        title: "Unknown Error",
        message: "An unknown error occurred",
        suggestions: ["Try again", "Contact support if the problem persists"],
        severity: "error",
        category: "system",
      };
    }

    // Use the first error as the primary error
    const primaryError = errors[0];
    const template =
      ERROR_TEMPLATES[primaryError.code] || ERROR_TEMPLATES.VALIDATION_ERROR;

    // Get platform-specific suggestions
    const platformSuggestions = this.getPlatformSpecificErrorGuidance(
      primaryError.code,
      originalPath
    );

    // Combine suggestions from template, error, and platform-specific guidance
    const suggestions = [
      ...(template.suggestions || []),
      ...(primaryError.suggestions || []),
      ...platformSuggestions,
    ];

    // Remove duplicates while preserving order
    const uniqueSuggestions = Array.from(new Set(suggestions));

    // Limit suggestions to avoid overwhelming the user
    const limitedSuggestions = uniqueSuggestions.slice(0, 8);

    return {
      title: template.title || "Error",
      message: primaryError.message || template.message || "An error occurred",
      details: this.formatErrorDetails(errors, warnings, originalPath),
      suggestions: limitedSuggestions,
      learnMoreUrl: template.learnMoreUrl,
      severity: template.severity || "error",
      category: template.category || "system",
    };
  }

  /**
   * Create a user-friendly warning message
   */
  createWarningMessage(warnings: PathWarning[]): UserFriendlyError | null {
    if (warnings.length === 0) {
      return null;
    }

    const primaryWarning = warnings[0];
    const template = WARNING_TEMPLATES[primaryWarning.code] || {
      title: "Warning",
      message: primaryWarning.message,
      suggestions: ["Please review this warning"],
      severity: "warning" as const,
      category: "system" as const,
    };

    return {
      title: template.title || "Warning",
      message:
        primaryWarning.message || template.message || "A warning occurred",
      details:
        warnings.length > 1 ? `${warnings.length} warnings found` : undefined,
      suggestions: template.suggestions || ["Please review this warning"],
      severity: template.severity || "warning",
      category: template.category || "system",
    };
  }

  /**
   * Create error message for network-related issues
   */
  createNetworkErrorMessage(
    path: string,
    errorMessage: string
  ): UserFriendlyError {
    const isUNCPath = path.startsWith("\\\\");
    const template = isUNCPath
      ? ERROR_TEMPLATES.UNC_PATH_INVALID
      : ERROR_TEMPLATES.NETWORK_ERROR;

    return {
      title: template.title || "Network Error",
      message: template.message || "Network operation failed",
      details: `Path: ${path}\nError: ${errorMessage}`,
      suggestions: template.suggestions || ["Check your network connection"],
      severity: "error",
      category: "network",
    };
  }

  /**
   * Create error message for timeout issues
   */
  createTimeoutErrorMessage(
    path: string,
    timeoutMs: number
  ): UserFriendlyError {
    const template = ERROR_TEMPLATES.TIMEOUT_ERROR;

    return {
      title: template.title || "Timeout Error",
      message: `Operation timed out after ${timeoutMs}ms`,
      details: `Path: ${path}`,
      suggestions: [
        ...(template.suggestions || []),
        `Try increasing timeout beyond ${timeoutMs}ms`,
      ],
      severity: "error",
      category: "system",
    };
  }

  /**
   * Get platform-specific suggestions for path issues
   */
  getPlatformSpecificSuggestions(): {
    platform: string;
    examples: string[];
    tips: string[];
    commonIssues: string[];
  } {
    const isWindows = navigator.platform.toLowerCase().includes("win");
    const isMac = navigator.platform.toLowerCase().includes("mac");

    if (isWindows) {
      return {
        platform: "Windows",
        examples: [
          "C:\\Users\\Username\\Documents\\MyProject",
          "C:/Users/Username/Documents/MyProject",
          "\\\\server\\share\\folder",
          ".\\relative\\path",
          "..\\parent\\directory",
        ],
        tips: [
          "Use either forward slashes (/) or backslashes (\\)",
          "Drive letters should be followed by a colon (C:, D:, etc.)",
          "UNC paths start with \\\\ for network locations",
          "Avoid reserved names like CON, PRN, AUX, NUL, COM1-9, LPT1-9",
          "Maximum path length is 260 characters (unless long paths are enabled)",
          "Folder names cannot end with spaces or dots",
          'Invalid characters: < > : " | ? *',
        ],
        commonIssues: [
          "Drive letter missing or incorrect (should be C:, D:, etc.)",
          "Using reserved names like CON, PRN, AUX in folder names",
          "Path too long (over 260 characters)",
          "Trailing spaces or dots in folder names",
          "Invalid characters in path",
          "Network path not accessible or incorrectly formatted",
        ],
      };
    }
    if (isMac) {
      return {
        platform: "macOS",
        examples: [
          "/Users/username/Documents/MyProject",
          "~/Documents/MyProject",
          "/Volumes/ExternalDrive/Code",
          "./relative/path",
          "../parent/directory",
        ],
        tips: [
          "Paths are case-sensitive",
          "Use forward slashes (/) as path separators",
          "Paths starting with / are absolute",
          "Paths starting with ./ or ../ are relative",
          "~ represents the home directory",
          "Avoid colons (:) in folder names",
          "External drives appear in /Volumes/",
        ],
        commonIssues: [
          "Case sensitivity issues (MyFolder vs myfolder)",
          "Using backslashes instead of forward slashes",
          "Colons in folder names (not allowed)",
          "External drive not mounted or path incorrect",
          "Permission issues with system directories",
          "Hidden files or folders (starting with .)",
        ],
      };
    }
    return {
      platform: "Linux/Unix",
      examples: [
        "/home/username/projects/myrepo",
        "~/projects/myrepo",
        "/opt/projects/team-repo",
        "./relative/path",
        "../parent/directory",
      ],
      tips: [
        "Paths are case-sensitive",
        "Use forward slashes (/) as path separators",
        "Paths starting with / are absolute",
        "Paths starting with ./ or ../ are relative",
        "~ represents the home directory",
        "Avoid spaces in paths (use underscores or hyphens)",
        "Hidden files and folders start with a dot (.)",
      ],
      commonIssues: [
        "Case sensitivity issues (MyFolder vs myfolder)",
        "Using backslashes instead of forward slashes",
        "Permission issues with system directories",
        "Spaces in paths causing command-line issues",
        "Filesystem not mounted or path incorrect",
        "Symbolic links pointing to non-existent targets",
      ],
    };
  }

  /**
   * Format detailed error information
   */
  private formatErrorDetails(
    errors: PathError[],
    warnings: PathWarning[],
    originalPath?: string
  ): string {
    const details: string[] = [];

    if (originalPath) {
      details.push(`Original path: ${originalPath}`);
    }

    if (errors.length > 1) {
      details.push(`${errors.length} errors found:`);
      errors.forEach((error, index) => {
        details.push(`${index + 1}. ${error.code}: ${error.message}`);
      });
    }

    if (warnings.length > 0) {
      details.push(`${warnings.length} warnings:`);
      warnings.forEach((warning, index) => {
        details.push(`${index + 1}. ${warning.code}: ${warning.message}`);
      });
    }

    return details.join("\n");
  }

  /**
   * Get platform-specific error guidance for specific error codes
   */
  getPlatformSpecificErrorGuidance(
    errorCode: string,
    _path?: string
  ): string[] {
    const isWindows = navigator.platform.toLowerCase().includes("win");
    const isMac = navigator.platform.toLowerCase().includes("mac");

    const guidance: Record<
      string,
      {
        windows?: string[];
        macos?: string[];
        linux?: string[];
        generic: string[];
      }
    > = {
      PATH_NOT_FOUND: {
        windows: [
          "Open Windows Explorer and navigate to verify the path exists",
          "Check if the drive letter is correct (C:, D:, etc.)",
          "For network paths (\\\\server\\share), ensure you're connected to the network",
          "If it's an external drive, make sure it's connected and recognized",
          "Check if the folder was recently moved or renamed",
        ],
        macos: [
          "Open Finder and navigate to verify the path exists",
          "Check if external drives are properly mounted in /Volumes",
          "For network paths, verify the connection in Finder's sidebar",
          "Check if the folder was recently moved to Trash",
          "Verify case sensitivity (MyFolder vs myfolder)",
        ],
        linux: [
          "Use `ls -la` command to verify the directory exists",
          "Check if external drives are mounted with `mount` command",
          "For network filesystems, verify the mount point with `df -h`",
          "Check file permissions with `ls -ld` on the parent directory",
          "Verify case sensitivity (MyFolder vs myfolder)",
        ],
        generic: [
          "Double-check the spelling and capitalization of the path",
          "Navigate to the parent directory and verify the folder exists",
          "Copy the path directly from your file manager",
          "Ensure you have permission to access the directory",
        ],
      },
      READ_PERMISSION_DENIED: {
        windows: [
          'Right-click the folder and select "Properties" → "Security" tab',
          "Click 'Edit' and ensure your user account has Read permissions",
          "Try running the application as Administrator",
          "Check if the folder is on a network drive - contact your network administrator",
          "Disable any antivirus real-time protection temporarily to test",
        ],
        macos: [
          "Check folder permissions in Finder: right-click → Get Info → Sharing & Permissions",
          "Change your permission level to 'Read & Write' if you own the folder",
          "Use Terminal: `sudo chmod -R 755 /path/to/folder` (if you own it)",
          "Ensure the folder isn't in a restricted system location like /System",
        ],
        linux: [
          "Check current permissions: `ls -la /path/to/folder`",
          "Add read permissions: `chmod +r /path/to/folder` (if you own it)",
          "For recursive permissions: `chmod -R +r /path/to/folder`",
          "Check if you're in the correct group: `groups` command",
        ],
        generic: [
          "Verify you have the necessary permissions for the folder",
          "Try accessing the folder through your file manager first",
          "Copy the repository to a location you have full access to",
          "Contact your system administrator if it's a shared folder",
        ],
      },
      TIMEOUT_ERROR: {
        windows: [
          "Check if the path is on a slow network drive",
          "Ensure Windows Defender or antivirus is not scanning the directory",
          "Try accessing a subdirectory instead of the entire repository",
          "Check if the drive is experiencing hardware issues",
        ],
        macos: [
          "Check if the path is on a mounted network drive",
          "Ensure Spotlight indexing is not running on the directory",
          "Try accessing a subdirectory instead of the entire repository",
          "Check Activity Monitor for high disk usage",
        ],
        linux: [
          "Check if the path is on a mounted network filesystem",
          "Check system load and available resources with `top` or `htop`",
          "Try accessing a subdirectory instead of the entire repository",
          "Check disk I/O with `iostat` command",
        ],
        generic: [
          "Try again with a smaller directory",
          "Check your network connection if accessing a remote path",
          "Wait for any background processes to complete",
          "Try the operation during off-peak hours",
        ],
      },
      PERMISSION_CHECK_ERROR: {
        windows: [
          "Try running the application as Administrator",
          "Check if the path is on a network drive with restricted access",
          "Ensure Windows Security isn't blocking access to the path",
          "Check if antivirus software is interfering with file access",
        ],
        macos: [
          "Check System Preferences → Security & Privacy → Privacy tab",
          "Ensure the application has Full Disk Access if needed",
          "Try using `sudo` if accessing system directories",
          "Check if the path is on an external drive with permission issues",
        ],
        linux: [
          "Check file permissions with `ls -la` command",
          "Ensure you're in the correct user group for the path",
          "Try using `sudo` if accessing system directories",
          "Check if SELinux or AppArmor policies are blocking access",
        ],
        generic: [
          "Verify the path exists and is accessible",
          "Check if you have the necessary permissions",
          "Try accessing the path through your file manager first",
          "Contact your system administrator if needed",
        ],
      },
      WINDOWS_PERMISSION_CHECK_ERROR: {
        windows: [
          "Right-click the application and select 'Run as administrator'",
          "Check Windows Security settings for the specific path",
          "Ensure the path isn't in a protected system directory",
          "Try disabling real-time antivirus protection temporarily",
          "Check if Windows Defender SmartScreen is blocking access",
        ],
        generic: [
          "Try running with elevated privileges",
          "Check system security settings",
          "Verify the path is accessible through other applications",
          "Contact your system administrator for assistance",
        ],
      },
    };

    const errorGuidance = guidance[errorCode];
    if (!errorGuidance) {
      return [];
    }

    if (isWindows && errorGuidance.windows) {
      return [...errorGuidance.windows, ...errorGuidance.generic];
    }
    if (isMac && errorGuidance.macos) {
      return [...errorGuidance.macos, ...errorGuidance.generic];
    }
    if (errorGuidance.linux) {
      return [...errorGuidance.linux, ...errorGuidance.generic];
    }

    return errorGuidance.generic;
  }

  /**
   * Get error category color for UI styling
   */
  getCategoryColor(category: UserFriendlyError["category"]): {
    bg: string;
    border: string;
    text: string;
    icon: string;
  } {
    switch (category) {
      case "path":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          icon: "text-red-400",
        };
      case "permission":
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          text: "text-orange-800",
          icon: "text-orange-400",
        };
      case "network":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
          text: "text-purple-800",
          icon: "text-purple-400",
        };
      case "system":
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-800",
          icon: "text-gray-400",
        };
      case "validation":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
          icon: "text-yellow-400",
        };
      default:
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          icon: "text-red-400",
        };
    }
  }

  /**
   * Get severity color for UI styling
   */
  getSeverityColor(severity: UserFriendlyError["severity"]): {
    bg: string;
    border: string;
    text: string;
    icon: string;
  } {
    switch (severity) {
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          icon: "text-red-400",
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
          icon: "text-yellow-400",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
          icon: "text-blue-400",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-800",
          icon: "text-gray-400",
        };
    }
  }
}

// Export singleton instance
export const errorMessageService = new ErrorMessageService();
export default errorMessageService;
