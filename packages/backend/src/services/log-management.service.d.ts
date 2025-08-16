import { EventEmitter } from 'node:events';

export interface LogRetentionPolicy {
  maxAge: number;
  maxSize: string;
  maxFiles: number;
  cleanupInterval: number;
}

export interface LogFileInfo {
  path: string;
  size: number;
  created: Date;
  modified: Date;
  age: number;
}

export interface LogManagementConfig {
  logDirectory: string;
  retentionPolicy: LogRetentionPolicy;
  monitoringEnabled: boolean;
  alertThresholds: {
    diskUsage: number;
    fileSize: string;
    errorRate: number;
  };
}

export interface LogAlert {
  type: 'DISK_USAGE' | 'FILE_SIZE' | 'ERROR_RATE' | 'CLEANUP_FAILED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details: Record<string, any>;
  timestamp: Date;
}

export declare class LogManagementService extends EventEmitter {
  constructor(config?: Partial<LogManagementConfig>);

  start(): Promise<void>;
  stop(): Promise<void>;

  performCleanup(): Promise<{
    filesRemoved: number;
    spaceFreed: number;
    errors: string[];
  }>;

  getLogFiles(): Promise<LogFileInfo[]>;

  getLogDirectoryStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    oldestFile: Date | null;
    newestFile: Date | null;
    averageFileSize: number;
  }>;

  performMonitoring(): Promise<void>;
  updateRetentionPolicy(policy: Partial<LogRetentionPolicy>): void;
  getConfig(): LogManagementConfig;
}

export declare const logManagementService: LogManagementService;
