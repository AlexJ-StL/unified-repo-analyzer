import { platform } from 'node:os';
import type { PathError, PathWarning } from './path-handler.service';

/**
 * Error message template interface
 */
export interface ErrorMessageTemplate {
  title: string;
  message: string;
  details?: string;
  suggestions: string[];
  learnMoreUrl?: string;
}

/**
 * Platform-specific error guidance
 */
export interface PlatformGuidance {
  windows?: string[];
  macos?: string[];
  linux?: string[];
  generic: string[];
}

/**
 * Error message service for creating user-friendly error messages
 */
export class ErrorMessageService {
  private static instance: ErrorMessageService;
  private readonly currentPlatform: string;

  constructor() {
    this.currentPlatform = platform();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorMessageService {
    if (!ErrorMessageService.instance) {
      ErrorMessageService.instance = new ErrorMessageService();
    }
    return ErrorMessageService.instance;
  }

  /**
   * Create user-friendly error message for path validation errors
   */
  public createPathErrorMessage(errors: PathError[], warnings: PathWarning[], path: string): ErrorMessageTemplate {
    // Determine the primary error type
    const primaryError = this.getPrimaryError(errors);
    
    switch (primaryError.code) {
      case 'PATH_NOT_FOUND':
        return this.createPathNotFoundMessage(path);
      
      case 'PATH_INVALID_FORMAT':
        return this.createInvalidFormatMessage(path, errors);
      
      case 'PATH_TOO_LONG':
        return this.createPathTooLongMessage(path, errors);
      
      case 'RESERVED_NAME':
        return this.createReservedNameMessage(path, errors);
      
      case 'INVALID_CHARACTERS':
        return this.createInvalidCharactersMessage(path, errors);
      
      case 'INVALID_DRIVE_LETTER':
        return this.createInvalidDriveLetterMessage(path);
      
      case 'INVALID_UNC_PATH':
        return this.createInvalidUNCPathMessage(path);
      
      case 'READ_PERMISSION_DENIED':
        return this.createPermissionDeniedMessage(path, 'read');
      
      case 'WRITE_PERMISSION_DENIED':
        return this.createPermissionDeniedMessage(path, 'write');
      
      case 'SYSTEM_PATH_ACCESS':
        return this.createSystemPathAccessMessage(path);
      
      case 'VALIDATION_ERROR':
        return this.createGenericValidationErrorMessage(path, primaryError);
      
      case 'TIMEOUT_ERROR':
        return this.createTimeoutErrorMessage(path);
      
      case 'OPERATION_CANCELLED':
        return this.createOperationCancelledMessage(path);
      
      default:
        return this.createGenericErrorMessage(path, errors);
    }
  }

  /**
   * Create error message for network/connectivity issues
   */
  public createNetworkErrorMessage(path: string, errorDetails?: string): ErrorMessageTemplate {
    const isUNCPath = path.startsWith('\\\\');
    
    if (isUNCPath) {
      return {
        title: 'Network Path Not Accessible',
        message: `Cannot access the network path "${path}". The network location may be unavailable or you may not have permission to access it.`,
        details: errorDetails,
        suggestions: [
          'Check your network connection',
          'Verify the server name and share path are correct',
          'Ensure you have permission to access the network share',
          'Try accessing the path through Windows Explorer first',
          'Contact your network administrator if the issue persists'
        ],
        learnMoreUrl: 'https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file#unc'
      };
    }

    return {
      title: 'Network Connection Error',
      message: `A network error occurred while trying to access "${path}".`,
      details: errorDetails,
      suggestions: [
        'Check your network connection',
        'Verify the path is accessible',
        'Try again in a few moments',
        'Contact your system administrator if the issue persists'
      ]
    };
  }

  /**
   * Create error message for timeout issues
   */
  public createTimeoutErrorMessage(path: string): ErrorMessageTemplate {
    return {
      title: 'Operation Timed Out',
      message: `The operation timed out while trying to access "${path}". This may be due to a slow network connection or a very large directory.`,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Check if the path is on a slow network drive',
          'Try accessing a subdirectory instead of the entire repository',
          'Ensure Windows Defender or antivirus is not scanning the directory'
        ],
        macos: [
          'Check if the path is on a mounted network drive',
          'Try accessing a subdirectory instead of the entire repository',
          'Ensure Spotlight indexing is not running on the directory'
        ],
        linux: [
          'Check if the path is on a mounted network filesystem',
          'Try accessing a subdirectory instead of the entire repository',
          'Check system load and available resources'
        ],
        generic: [
          'Try again with a smaller directory',
          'Check your network connection if accessing a remote path',
          'Contact support if the issue persists'
        ]
      })
    };
  }

  /**
   * Create error message for cancelled operations
   */
  public createOperationCancelledMessage(path: string): ErrorMessageTemplate {
    return {
      title: 'Operation Cancelled',
      message: `The operation was cancelled while processing "${path}".`,
      suggestions: [
        'Try the operation again if it was cancelled unintentionally',
        'Ensure the path is accessible before retrying',
        'Contact support if you continue to experience issues'
      ]
    };
  }

  /**
   * Get the primary (most important) error from a list of errors
   */
  private getPrimaryError(errors: PathError[]): PathError {
    if (errors.length === 0) {
      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred'
      };
    }

    // Priority order for error types
    const errorPriority = [
      'PATH_NOT_FOUND',
      'READ_PERMISSION_DENIED',
      'WRITE_PERMISSION_DENIED',
      'SYSTEM_PATH_ACCESS',
      'INVALID_DRIVE_LETTER',
      'INVALID_UNC_PATH',
      'PATH_INVALID_FORMAT',
      'RESERVED_NAME',
      'INVALID_CHARACTERS',
      'PATH_TOO_LONG',
      'TIMEOUT_ERROR',
      'OPERATION_CANCELLED',
      'VALIDATION_ERROR'
    ];

    for (const priority of errorPriority) {
      const error = errors.find(e => e.code === priority);
      if (error) {
        return error;
      }
    }

    return errors[0];
  }

  /**
   * Create path not found error message
   */
  private createPathNotFoundMessage(path: string): ErrorMessageTemplate {
    return {
      title: 'Repository Path Not Found',
      message: `The repository path "${path}" does not exist or cannot be accessed.`,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Check if the drive letter is correct (e.g., C:\\, D:\\)',
          'Verify the folder path exists in Windows Explorer',
          'Ensure the path uses backslashes (\\) or forward slashes (/)',
          'Check if the network drive is connected (for UNC paths like \\\\server\\share)'
        ],
        macos: [
          'Verify the folder path exists in Finder',
          'Check if external drives are properly mounted',
          'Ensure the path uses forward slashes (/)',
          'For network paths, verify the connection in Finder'
        ],
        linux: [
          'Verify the directory exists using `ls` command',
          'Check if external drives are properly mounted',
          'Ensure the path uses forward slashes (/)',
          'For network filesystems, verify the mount point'
        ],
        generic: [
          'Double-check the spelling of the path',
          'Navigate to the parent directory and verify the folder exists',
          'Try using an absolute path instead of a relative path'
        ]
      }),
      learnMoreUrl: 'https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories'
    };
  }

  /**
   * Create invalid format error message
   */
  private createInvalidFormatMessage(path: string, errors: PathError[]): ErrorMessageTemplate {
    const formatError = errors.find(e => e.code === 'PATH_INVALID_FORMAT');
    
    return {
      title: 'Invalid Path Format',
      message: `The path "${path}" has an invalid format for your operating system.`,
      details: formatError?.details,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Use backslashes (\\) to separate directories: C:\\Users\\YourName\\Documents',
          'Or use forward slashes (/): C:/Users/YourName/Documents',
          'Start with a drive letter: C:, D:, etc.',
          'For network paths, use UNC format: \\\\server\\share\\folder'
        ],
        macos: [
          'Use forward slashes (/) to separate directories: /Users/YourName/Documents',
          'Start with a forward slash for absolute paths',
          'Use ~ for home directory: ~/Documents'
        ],
        linux: [
          'Use forward slashes (/) to separate directories: /home/username/documents',
          'Start with a forward slash for absolute paths',
          'Use ~ for home directory: ~/documents'
        ],
        generic: [
          'Avoid special characters in path names',
          'Use the correct path separator for your operating system',
          'Try copying the path from your file manager'
        ]
      })
    };
  }

  /**
   * Create path too long error message
   */
  private createPathTooLongMessage(path: string, errors: PathError[]): ErrorMessageTemplate {
    const lengthError = errors.find(e => e.code === 'PATH_TOO_LONG');
    
    return {
      title: 'Path Too Long',
      message: `The path "${path}" exceeds the maximum length allowed by your operating system.`,
      details: lengthError?.details,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Move the repository closer to the root directory (e.g., C:\\repos\\project)',
          'Use shorter folder names in the path',
          'Enable long path support in Windows 10/11 via Group Policy',
          'Use the Windows Subsystem for Linux (WSL) for longer paths'
        ],
        macos: [
          'Use shorter folder names in the path',
          'Move the repository closer to the root directory',
          'Consider using symbolic links for deeply nested directories'
        ],
        linux: [
          'Use shorter folder names in the path',
          'Move the repository closer to the root directory',
          'Consider using symbolic links for deeply nested directories'
        ],
        generic: [
          'Shorten directory names in the path',
          'Move the repository to a location with a shorter path',
          'Remove unnecessary nested directories'
        ]
      }),
      learnMoreUrl: 'https://docs.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation'
    };
  }

  /**
   * Create reserved name error message
   */
  private createReservedNameMessage(path: string, errors: PathError[]): ErrorMessageTemplate {
    const reservedError = errors.find(e => e.code === 'RESERVED_NAME');
    
    return {
      title: 'Reserved Name in Path',
      message: `The path "${path}" contains a reserved name that cannot be used.`,
      details: reservedError?.details,
      suggestions: [
        'Rename the folder to avoid reserved names like CON, PRN, AUX, NUL',
        'Avoid names like COM1-COM9 and LPT1-LPT9',
        'Add a prefix or suffix to the folder name (e.g., "my_con" instead of "con")',
        'Choose a different name that doesn\'t conflict with system reserved names'
      ],
      learnMoreUrl: 'https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file#naming-conventions'
    };
  }

  /**
   * Create invalid characters error message
   */
  private createInvalidCharactersMessage(path: string, errors: PathError[]): ErrorMessageTemplate {
    const charError = errors.find(e => e.code === 'INVALID_CHARACTERS');
    
    return {
      title: 'Invalid Characters in Path',
      message: `The path "${path}" contains characters that are not allowed.`,
      details: charError?.details,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Remove or replace these characters: < > : " | ? *',
          'Avoid control characters (ASCII 0-31)',
          'Don\'t end folder names with spaces or dots',
          'Use underscores (_) or hyphens (-) instead of special characters'
        ],
        macos: [
          'Avoid using colons (:) in file names',
          'Remove or replace problematic characters',
          'Use underscores (_) or hyphens (-) instead'
        ],
        linux: [
          'Avoid using forward slashes (/) in file names',
          'Remove or replace problematic characters',
          'Use underscores (_) or hyphens (-) instead'
        ],
        generic: [
          'Use only letters, numbers, underscores, and hyphens',
          'Avoid special characters and symbols',
          'Replace spaces with underscores or hyphens'
        ]
      })
    };
  }

  /**
   * Create invalid drive letter error message
   */
  private createInvalidDriveLetterMessage(path: string): ErrorMessageTemplate {
    return {
      title: 'Invalid Drive Letter',
      message: `The path "${path}" has an invalid drive letter format.`,
      suggestions: [
        'Use a valid drive letter from A to Z followed by a colon: C:, D:, etc.',
        'Include a backslash after the colon: C:\\, D:\\',
        'Check if the drive exists and is accessible',
        'Try using a different drive letter if the current one is not available'
      ]
    };
  }

  /**
   * Create invalid UNC path error message
   */
  private createInvalidUNCPathMessage(path: string): ErrorMessageTemplate {
    return {
      title: 'Invalid Network Path Format',
      message: `The network path "${path}" has an invalid UNC format.`,
      suggestions: [
        'Use the correct UNC format: \\\\server\\share\\folder',
        'Start with exactly two backslashes (\\\\)',
        'Include both server name and share name',
        'Verify the server and share names are correct',
        'Test the path in Windows Explorer first'
      ],
      learnMoreUrl: 'https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file#unc'
    };
  }

  /**
   * Create permission denied error message
   */
  private createPermissionDeniedMessage(path: string, permissionType: 'read' | 'write'): ErrorMessageTemplate {
    const action = permissionType === 'read' ? 'access' : 'modify';
    
    return {
      title: `Permission Denied`,
      message: `You don't have permission to ${action} the repository at "${path}".`,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Right-click the folder and select "Properties" → "Security" tab',
          'Ensure your user account has the necessary permissions',
          'Try running the application as Administrator',
          'Check if the folder is on a network drive with restricted access',
          'Contact your system administrator for access to restricted folders'
        ],
        macos: [
          'Check folder permissions in Finder (Get Info → Sharing & Permissions)',
          'Use `chmod` command to modify permissions if you own the folder',
          'Try running with `sudo` if you have administrator privileges',
          'Ensure the folder is not in a restricted system location'
        ],
        linux: [
          'Check folder permissions with `ls -la` command',
          'Use `chmod` command to modify permissions if you own the folder',
          'Try running with `sudo` if you have administrator privileges',
          'Ensure you\'re in the correct user group for accessing the folder'
        ],
        generic: [
          'Verify you have the necessary permissions for the folder',
          'Try accessing the folder through your file manager first',
          'Contact your system administrator if it\'s a shared folder',
          'Choose a different repository location that you can access'
        ]
      })
    };
  }

  /**
   * Create system path access error message
   */
  private createSystemPathAccessMessage(path: string): ErrorMessageTemplate {
    return {
      title: 'System Directory Access',
      message: `The path "${path}" is a system directory that may require special permissions to access.`,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Avoid analyzing system directories like C:\\Windows, C:\\Program Files',
          'Choose a user directory like C:\\Users\\YourName\\Documents',
          'If you must access system directories, run as Administrator',
          'Consider copying the repository to a user-accessible location'
        ],
        macos: [
          'Avoid analyzing system directories like /System, /usr',
          'Choose a user directory like ~/Documents or ~/Desktop',
          'If you must access system directories, use sudo',
          'Consider copying the repository to a user-accessible location'
        ],
        linux: [
          'Avoid analyzing system directories like /etc, /usr, /var',
          'Choose a user directory like ~/documents or ~/projects',
          'If you must access system directories, use sudo',
          'Consider copying the repository to a user-accessible location'
        ],
        generic: [
          'Choose a repository in your user directory instead',
          'Avoid system and protected directories',
          'Copy the repository to an accessible location if needed'
        ]
      })
    };
  }

  /**
   * Create generic validation error message
   */
  private createGenericValidationErrorMessage(path: string, error: PathError): ErrorMessageTemplate {
    return {
      title: 'Path Validation Error',
      message: `There was an error validating the repository path "${path}".`,
      details: error.details || error.message,
      suggestions: [
        'Verify the path is correct and accessible',
        'Check if the directory exists',
        'Ensure you have proper permissions',
        'Try using a different path format',
        'Contact support if the issue persists'
      ]
    };
  }

  /**
   * Create generic error message
   */
  private createGenericErrorMessage(path: string, errors: PathError[]): ErrorMessageTemplate {
    const errorMessages = errors.map(e => e.message).join(', ');
    
    return {
      title: 'Repository Path Error',
      message: `There was an error with the repository path "${path}".`,
      details: errorMessages,
      suggestions: [
        'Check if the path is correct and exists',
        'Verify you have permission to access the directory',
        'Try using an absolute path instead of a relative path',
        'Ensure the path points to a directory, not a file',
        'Contact support if you continue to experience issues'
      ]
    };
  }

  /**
   * Get platform-specific suggestions
   */
  private getPlatformSpecificSuggestions(guidance: PlatformGuidance): string[] {
    const platformSuggestions = guidance[this.currentPlatform as keyof PlatformGuidance] || [];
    return [...platformSuggestions, ...guidance.generic];
  }
}

// Export singleton instance
export const errorMessageService = ErrorMessageService.getInstance();
export default errorMessageService;