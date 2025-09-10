import { platform } from 'node:os';
import type { PathError, PathWarning } from './path-handler.service.js';

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
  public createPathErrorMessage(
    errors: PathError[],
    _warnings: PathWarning[],
    path: string
  ): ErrorMessageTemplate {
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

      case 'NULL_BYTE_IN_PATH':
        return this.createNullByteErrorMessage(path);

      case 'CONTROL_CHARACTERS':
        return this.createControlCharactersErrorMessage(path, errors);

      case 'INVALID_COMPONENT_ENDING':
        return this.createInvalidComponentEndingMessage(path, errors);

      case 'PERMISSION_CHECK_ERROR':
        return this.createPermissionCheckErrorMessage(path, primaryError);

      case 'WINDOWS_PERMISSION_CHECK_ERROR':
        return this.createWindowsPermissionCheckErrorMessage(path, primaryError);

      case 'READ_ONLY_FILE':
        return this.createReadOnlyFileErrorMessage(path);

      case 'OWNERSHIP_INFO_ERROR':
        return this.createOwnershipInfoErrorMessage(path, primaryError);

      case 'INVALID_INPUT':
        return this.createInvalidInputErrorMessage(path);

      case 'NOT_DIRECTORY':
        return this.createNotDirectoryErrorMessage(path);

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
          'Test your network connection to other resources',
          'Verify the server name is correct and the server is online',
          'Check the share name exists on the server',
          'Try accessing the path through Windows Explorer first',
          "Ensure you're connected to the correct network (VPN, corporate network)",
          'Verify you have credentials to access the network share',
          'Try mapping the network drive first (Map Network Drive in Explorer)',
          'Contact your network administrator if the server should be accessible',
          'Check if your firewall or antivirus is blocking network access',
        ],
        learnMoreUrl: 'https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file#unc',
      };
    }

    return {
      title: 'Network Connection Error',
      message: `A network error occurred while trying to access "${path}".`,
      details: errorDetails,
      suggestions: [
        'Check your internet/network connection',
        'Verify the path is accessible from your current network',
        'Try accessing other network resources to test connectivity',
        'Wait a few moments and try again (temporary network issues)',
        'Check if you need to connect to a VPN',
        'Verify DNS resolution is working properly',
        'Contact your system administrator if the issue persists',
        'Try using a local copy of the repository if available',
      ],
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
          'Ensure Windows Defender or antivirus is not scanning the directory',
        ],
        macos: [
          'Check if the path is on a mounted network drive',
          'Try accessing a subdirectory instead of the entire repository',
          'Ensure Spotlight indexing is not running on the directory',
        ],
        linux: [
          'Check if the path is on a mounted network filesystem',
          'Try accessing a subdirectory instead of the entire repository',
          'Check system load and available resources',
        ],
        generic: [
          'Try again with a smaller directory',
          'Check your network connection if accessing a remote path',
          'Contact support if the issue persists',
        ],
      }),
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
        'Contact support if you continue to experience issues',
      ],
    };
  }

  /**
   * Create error message for null byte in path
   */
  public createNullByteErrorMessage(path: string): ErrorMessageTemplate {
    return {
      title: 'Invalid Path - Security Risk',
      message: `The path "${path}" contains null bytes, which is a potential security vulnerability.`,
      details:
        'Null bytes in file paths can be used in path traversal attacks and are not allowed.',
      suggestions: [
        'Remove any null bytes (\\0) from the path',
        'Ensure the path comes from a trusted source',
        'Validate input before using it as a file path',
        'Contact support if you believe this is an error',
      ],
    };
  }

  /**
   * Create error message for control characters in path
   */
  public createControlCharactersErrorMessage(
    path: string,
    errors: PathError[]
  ): ErrorMessageTemplate {
    const controlError = errors.find((e) => e.code === 'CONTROL_CHARACTERS');

    return {
      title: 'Invalid Control Characters in Path',
      message: `The path "${path}" contains control characters that are not allowed in file paths.`,
      details: controlError?.details,
      suggestions: [
        'Remove any control characters (ASCII 0-31) from the path',
        'Use only printable characters in file and folder names',
        'Copy the path from your file manager to avoid invisible characters',
        'Check for hidden characters if the path appears normal',
      ],
    };
  }

  /**
   * Create error message for invalid component ending
   */
  public createInvalidComponentEndingMessage(
    path: string,
    errors: PathError[]
  ): ErrorMessageTemplate {
    const endingError = errors.find((e) => e.code === 'INVALID_COMPONENT_ENDING');

    return {
      title: 'Invalid Path Component',
      message: `The path "${path}" contains a folder or file name that ends with a space or dot, which is not allowed.`,
      details: endingError?.details,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Remove trailing spaces and dots from folder names',
          'Windows automatically removes trailing spaces and dots, which can cause confusion',
          'Rename the folder to remove the trailing space or dot',
          'Use underscores or hyphens instead of trailing spaces',
        ],
        macos: [
          'Remove trailing spaces and dots from folder names',
          'Avoid names that end with spaces as they can cause issues',
          'Use underscores or hyphens instead of trailing spaces',
        ],
        linux: [
          'Remove trailing spaces and dots from folder names',
          'While technically allowed, trailing spaces can cause command-line issues',
          'Use underscores or hyphens instead of trailing spaces',
        ],
        generic: [
          'Rename folders to remove trailing spaces and dots',
          'Use descriptive names without trailing whitespace',
          'Check folder names in your file manager',
        ],
      }),
    };
  }

  /**
   * Create error message for permission check errors
   */
  public createPermissionCheckErrorMessage(path: string, error: PathError): ErrorMessageTemplate {
    return {
      title: 'Permission Check Failed',
      message: `Unable to check permissions for the path "${path}".`,
      details: error.details || error.message,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Ensure the path exists and is accessible',
          'Check if the drive is connected (for external drives)',
          'Try running the application as Administrator',
          'Verify network connectivity (for network paths)',
        ],
        macos: [
          'Ensure the path exists and is accessible',
          'Check if external drives are properly mounted',
          'Verify you have permission to access the parent directory',
          'Try using `sudo` if accessing system directories',
        ],
        linux: [
          'Ensure the path exists and is accessible',
          'Check if filesystems are properly mounted',
          'Verify you have permission to access the parent directory',
          'Try using `sudo` if accessing system directories',
        ],
        generic: [
          'Verify the path exists and is accessible',
          'Check your network connection for remote paths',
          'Try accessing the path through your file manager first',
          'Contact support if the issue persists',
        ],
      }),
    };
  }

  /**
   * Create error message for Windows-specific permission check errors
   */
  public createWindowsPermissionCheckErrorMessage(
    path: string,
    error: PathError
  ): ErrorMessageTemplate {
    return {
      title: 'Windows Permission Check Failed',
      message: `Windows-specific permission check failed for the path "${path}".`,
      details: error.details || error.message,
      suggestions: [
        'Try running the application as Administrator',
        'Check Windows Security settings for the folder',
        'Ensure the folder is not encrypted or compressed',
        'Verify the drive is not write-protected',
        'Check if Windows Defender is blocking access',
        'Try accessing the folder through Windows Explorer first',
        'Contact your system administrator if on a domain network',
      ],
    };
  }

  /**
   * Create error message for read-only file errors
   */
  public createReadOnlyFileErrorMessage(path: string): ErrorMessageTemplate {
    return {
      title: 'Read-Only File or Directory',
      message: `The path "${path}" is marked as read-only and cannot be modified.`,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Right-click the file/folder and select "Properties"',
          'Uncheck the "Read-only" attribute in the Properties dialog',
          'For folders, apply the change to all subfolders and files',
          'Check if the file is on a read-only network share',
          'Ensure you have permission to modify the read-only attribute',
        ],
        macos: [
          'Use "Get Info" to check and modify file permissions',
          'Change permissions using chmod command if you own the file',
          'Check if the file is on a read-only volume',
          'Ensure you have write permissions to the parent directory',
        ],
        linux: [
          'Use `chmod +w` to add write permissions',
          'Check file permissions with `ls -la`',
          'Ensure you own the file or have appropriate group permissions',
          'Check if the filesystem is mounted read-only',
        ],
        generic: [
          'Remove the read-only attribute from the file or folder',
          'Ensure you have permission to modify the file',
          'Check if the storage device is write-protected',
          'Try copying the file to a different location',
        ],
      }),
    };
  }

  /**
   * Create error message for ownership info errors
   */
  public createOwnershipInfoErrorMessage(path: string, error: PathError): ErrorMessageTemplate {
    return {
      title: 'File Ownership Information Unavailable',
      message: `Unable to retrieve ownership information for the path "${path}".`,
      details: error.details || error.message,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Check if you have permission to view file properties',
          'Try running as Administrator to access ownership information',
          'Ensure the file system supports ownership (NTFS vs FAT32)',
          'Check if the path is on a network drive with limited access',
        ],
        macos: [
          'Use `ls -la` to check file ownership from Terminal',
          'Ensure you have permission to access the file information',
          'Check if the file is on an external drive with different permissions',
          'Try using `sudo` if accessing system files',
        ],
        linux: [
          'Use `ls -la` to check file ownership',
          'Ensure the filesystem supports ownership information',
          'Check if you have permission to access the file metadata',
          'Verify the file system is properly mounted',
        ],
        generic: [
          'The file ownership information is not critical for analysis',
          'Try accessing the file through your file manager',
          'Contact support if this prevents normal operation',
          'Consider copying the file to a different location',
        ],
      }),
    };
  }

  /**
   * Create error message for invalid input
   */
  public createInvalidInputErrorMessage(path: string): ErrorMessageTemplate {
    return {
      title: 'Invalid Path Input',
      message: `The provided path "${path}" is not valid input.`,
      suggestions: [
        'Ensure the path is a non-empty string',
        'Check that the path contains valid characters',
        'Verify the path format is correct for your operating system',
        'Try copying the path from your file manager',
        'Remove any leading or trailing whitespace from the path',
      ],
    };
  }

  /**
   * Create error message for not directory errors
   */
  public createNotDirectoryErrorMessage(path: string): ErrorMessageTemplate {
    return {
      title: 'Path is Not a Directory',
      message: `The path "${path}" points to a file, but a directory is required for repository analysis.`,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Navigate to the parent folder containing your repository',
          'Select the folder (not a file) in Windows Explorer',
          'Look for a folder icon rather than a file icon',
          'Check if the path ends with a file extension (.txt, .js, etc.)',
        ],
        macos: [
          'Navigate to the parent folder containing your repository',
          'Select the folder (not a file) in Finder',
          'Look for a folder icon rather than a document icon',
          'Remove any file extension from the path',
        ],
        linux: [
          'Use `ls -la` to check if the path is a file or directory',
          'Navigate to the parent directory containing your repository',
          'Ensure the path points to a directory, not a regular file',
          'Remove any file extension from the path',
        ],
        generic: [
          'Select the repository folder, not a file within it',
          'Navigate to the parent directory if you selected a file',
          "Ensure you're pointing to the root of your repository",
          'Look for common repository files like README.md or .git folder',
        ],
      }),
    };
  }

  /**
   * Get the primary (most important) error from a list of errors
   */
  private getPrimaryError(errors: PathError[]): PathError {
    if (errors.length === 0) {
      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
      };
    }

    // Priority order for error types
    const errorPriority = [
      'PATH_NOT_FOUND',
      'NOT_DIRECTORY',
      'READ_PERMISSION_DENIED',
      'WRITE_PERMISSION_DENIED',
      'SYSTEM_PATH_ACCESS',
      'NULL_BYTE_IN_PATH',
      'INVALID_DRIVE_LETTER',
      'INVALID_UNC_PATH',
      'PATH_INVALID_FORMAT',
      'RESERVED_NAME',
      'INVALID_CHARACTERS',
      'CONTROL_CHARACTERS',
      'INVALID_COMPONENT_ENDING',
      'PATH_TOO_LONG',
      'READ_ONLY_FILE',
      'PERMISSION_CHECK_ERROR',
      'WINDOWS_PERMISSION_CHECK_ERROR',
      'OWNERSHIP_INFO_ERROR',
      'TIMEOUT_ERROR',
      'OPERATION_CANCELLED',
      'INVALID_INPUT',
      'VALIDATION_ERROR',
    ];

    for (const priority of errorPriority) {
      const error = errors.find((e) => e.code === priority);
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
      details:
        'We searched for the path but could not find it on your system. This could be due to a typo, missing folder, or access restrictions.',
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Open Windows Explorer and navigate to verify the path exists',
          'Check if the drive letter is correct (C:, D:, etc.)',
          "For network paths (\\\\server\\share), ensure you're connected to the network",
          'Try both backslashes (C:\\folder) and forward slashes (C:/folder)',
          "If it's an external drive, make sure it's connected and recognized",
          'Check if the folder was recently moved or renamed',
        ],
        macos: [
          'Open Finder and navigate to verify the path exists',
          'Check if external drives are properly mounted in /Volumes',
          "For network paths, verify the connection in Finder's sidebar",
          'Ensure the path uses forward slashes (/Users/name/folder)',
          'Check if the folder was recently moved to Trash',
        ],
        linux: [
          'Use `ls -la` command to verify the directory exists',
          'Check if external drives are mounted with `mount` command',
          'For network filesystems, verify the mount point with `df -h`',
          'Ensure the path uses forward slashes (/home/user/folder)',
          'Check file permissions with `ls -ld` on the parent directory',
        ],
        generic: [
          'Double-check the spelling and capitalization of the path',
          'Navigate to the parent directory and verify the folder exists',
          'Try using an absolute path instead of a relative path',
          'Copy the path directly from your file manager',
          'Ensure you have permission to access the directory',
        ],
      }),
      learnMoreUrl:
        'https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories',
    };
  }

  /**
   * Create invalid format error message
   */
  private createInvalidFormatMessage(path: string, errors: PathError[]): ErrorMessageTemplate {
    const formatError = errors.find((e) => e.code === 'PATH_INVALID_FORMAT');

    return {
      title: 'Invalid Path Format',
      message: `The path "${path}" has an invalid format for your operating system.`,
      details:
        formatError?.details ||
        "The path format doesn't match the expected pattern for your platform.",
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Use backslashes: C:\\Users\\YourName\\Documents\\MyRepo',
          'Or forward slashes: C:/Users/YourName/Documents/MyRepo',
          'Start with a drive letter (C:, D:, E:, etc.)',
          'For network paths: \\\\ServerName\\ShareName\\FolderName',
          'Avoid these characters: < > : " | ? *',
          'Example valid paths:',
          '  • C:\\Projects\\MyRepository',
          '  • D:/Code/WebApp',
          '  • \\\\FileServer\\Projects\\TeamRepo',
        ],
        macos: [
          'Use forward slashes: /Users/YourName/Documents/MyRepo',
          'Start with / for absolute paths: /Users/YourName/Projects',
          'Use ~ for home directory: ~/Documents/MyRepo',
          'Avoid colons (:) in folder names',
          'Example valid paths:',
          '  • /Users/john/Projects/WebApp',
          '  • ~/Documents/MyRepository',
          '  • /Volumes/ExternalDrive/Code',
        ],
        linux: [
          'Use forward slashes: /home/username/projects/myrepo',
          'Start with / for absolute paths: /home/username/code',
          'Use ~ for home directory: ~/projects/myrepo',
          'Avoid spaces in paths (use underscores or hyphens)',
          'Example valid paths:',
          '  • /home/developer/projects/webapp',
          '  • ~/code/my-repository',
          '  • /opt/projects/team-repo',
        ],
        generic: [
          'Copy the path directly from your file manager',
          'Use the correct path separator for your operating system',
          'Avoid special characters and symbols in folder names',
          "Ensure the path follows your system's naming conventions",
          'Try navigating to the folder first, then copy the path',
        ],
      }),
    };
  }

  /**
   * Create path too long error message
   */
  private createPathTooLongMessage(path: string, errors: PathError[]): ErrorMessageTemplate {
    const lengthError = errors.find((e) => e.code === 'PATH_TOO_LONG');

    return {
      title: 'Path Too Long',
      message: `The path "${path}" exceeds the maximum length allowed by your operating system.`,
      details: lengthError?.details,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Move the repository closer to the root directory (e.g., C:\\repos\\project)',
          'Use shorter folder names in the path',
          'Enable long path support in Windows 10/11 via Group Policy',
          'Use the Windows Subsystem for Linux (WSL) for longer paths',
        ],
        macos: [
          'Use shorter folder names in the path',
          'Move the repository closer to the root directory',
          'Consider using symbolic links for deeply nested directories',
        ],
        linux: [
          'Use shorter folder names in the path',
          'Move the repository closer to the root directory',
          'Consider using symbolic links for deeply nested directories',
        ],
        generic: [
          'Shorten directory names in the path',
          'Move the repository to a location with a shorter path',
          'Remove unnecessary nested directories',
        ],
      }),
      learnMoreUrl:
        'https://docs.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation',
    };
  }

  /**
   * Create reserved name error message
   */
  private createReservedNameMessage(path: string, errors: PathError[]): ErrorMessageTemplate {
    const reservedError = errors.find((e) => e.code === 'RESERVED_NAME');

    return {
      title: 'Reserved Name in Path',
      message: `The path "${path}" contains a reserved name that cannot be used.`,
      details: reservedError?.details,
      suggestions: [
        'Rename the folder to avoid reserved names like CON, PRN, AUX, NUL',
        'Avoid names like COM1-COM9 and LPT1-LPT9',
        'Add a prefix or suffix to the folder name (e.g., "my_con" instead of "con")',
        "Choose a different name that doesn't conflict with system reserved names",
      ],
      learnMoreUrl:
        'https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file#naming-conventions',
    };
  }

  /**
   * Create invalid characters error message
   */
  private createInvalidCharactersMessage(path: string, errors: PathError[]): ErrorMessageTemplate {
    const charError = errors.find((e) => e.code === 'INVALID_CHARACTERS');

    return {
      title: 'Invalid Characters in Path',
      message: `The path "${path}" contains characters that are not allowed.`,
      details: charError?.details,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Remove or replace these characters: < > : " | ? *',
          'Avoid control characters (ASCII 0-31)',
          "Don't end folder names with spaces or dots",
          'Use underscores (_) or hyphens (-) instead of special characters',
        ],
        macos: [
          'Avoid using colons (:) in file names',
          'Remove or replace problematic characters',
          'Use underscores (_) or hyphens (-) instead',
        ],
        linux: [
          'Avoid using forward slashes (/) in file names',
          'Remove or replace problematic characters',
          'Use underscores (_) or hyphens (-) instead',
        ],
        generic: [
          'Use only letters, numbers, underscores, and hyphens',
          'Avoid special characters and symbols',
          'Replace spaces with underscores or hyphens',
        ],
      }),
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
        'Try using a different drive letter if the current one is not available',
      ],
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
        'Test the path in Windows Explorer first',
      ],
      learnMoreUrl: 'https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file#unc',
    };
  }

  /**
   * Create permission denied error message
   */
  private createPermissionDeniedMessage(
    path: string,
    permissionType: 'read' | 'write'
  ): ErrorMessageTemplate {
    const action = permissionType === 'read' ? 'access' : 'modify';
    const actionDescription =
      permissionType === 'read'
        ? 'read files and analyze the repository'
        : 'write to or modify files in the repository';

    return {
      title: 'Permission Denied',
      message: `You don't have permission to ${action} the repository at "${path}".`,
      details: `The application needs ${permissionType} permissions to ${actionDescription}. This is typically due to file system security settings or ownership restrictions.`,
      suggestions: this.getPlatformSpecificSuggestions({
        windows: [
          'Right-click the folder and select "Properties" → "Security" tab',
          "Click 'Edit' and ensure your user account has Full Control or Read permissions",
          "If your account isn't listed, click 'Add' to add it",
          'Try running the application as Administrator (right-click → Run as administrator)',
          'Check if the folder is on a network drive - contact your network administrator',
          "Ensure the drive isn't write-protected (check the physical switch on USB drives)",
          'Disable any antivirus real-time protection temporarily to test',
        ],
        macos: [
          'Check folder permissions in Finder: right-click → Get Info → Sharing & Permissions',
          "Change your permission level to 'Read & Write' if you own the folder",
          'Use Terminal: `sudo chmod -R 755 /path/to/folder` (if you own it)',
          'Try running with administrator privileges: `sudo` command',
          "Ensure the folder isn't in a restricted system location like /System",
          'Check if the folder is on an external drive with different permissions',
        ],
        linux: [
          'Check current permissions: `ls -la /path/to/folder`',
          'Add read permissions: `chmod +r /path/to/folder` (if you own it)',
          'For recursive permissions: `chmod -R +r /path/to/folder`',
          'Try with administrator privileges: `sudo` command',
          "Check if you're in the correct group: `groups` command",
          "Ensure the filesystem isn't mounted read-only: `mount | grep /path`",
        ],
        generic: [
          'Verify you have the necessary permissions for the folder',
          'Try accessing the folder through your file manager first',
          'Copy the repository to a location you have full access to',
          "Contact your system administrator if it's a shared or corporate folder",
          'Choose a different repository location in your user directory',
          "Ensure the storage device isn't write-protected",
        ],
      }),
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
          'Consider copying the repository to a user-accessible location',
        ],
        macos: [
          'Avoid analyzing system directories like /System, /usr',
          'Choose a user directory like ~/Documents or ~/Desktop',
          'If you must access system directories, use sudo',
          'Consider copying the repository to a user-accessible location',
        ],
        linux: [
          'Avoid analyzing system directories like /etc, /usr, /var',
          'Choose a user directory like ~/documents or ~/projects',
          'If you must access system directories, use sudo',
          'Consider copying the repository to a user-accessible location',
        ],
        generic: [
          'Choose a repository in your user directory instead',
          'Avoid system and protected directories',
          'Copy the repository to an accessible location if needed',
        ],
      }),
    };
  }

  /**
   * Create generic validation error message
   */
  private createGenericValidationErrorMessage(
    path: string,
    error: PathError
  ): ErrorMessageTemplate {
    return {
      title: 'Path Validation Error',
      message: `There was an error validating the repository path "${path}".`,
      details: error.details || error.message,
      suggestions: [
        'Verify the path is correct and accessible',
        'Check if the directory exists',
        'Ensure you have proper permissions',
        'Try using a different path format',
        'Contact support if the issue persists',
      ],
    };
  }

  /**
   * Create generic error message
   */
  private createGenericErrorMessage(path: string, errors: PathError[]): ErrorMessageTemplate {
    const errorMessages = errors.map((e) => e.message).join(', ');

    return {
      title: 'Repository Path Error',
      message: `There was an error with the repository path "${path}".`,
      details: errorMessages,
      suggestions: [
        'Check if the path is correct and exists',
        'Verify you have permission to access the directory',
        'Try using an absolute path instead of a relative path',
        'Ensure the path points to a directory, not a file',
        'Contact support if you continue to experience issues',
      ],
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
