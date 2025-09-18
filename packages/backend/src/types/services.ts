/**
 * Service interfaces for dependency injection
 */

import type { UserPreferences } from '@unified-repo-analyzer/shared';

// Logger interface
export interface ILogger {
  debug(
    message: string,
    metadata?: Record<string, unknown>,
    component?: string,
    requestId?: string
  ): void;
  info(
    message: string,
    metadata?: Record<string, unknown>,
    component?: string,
    requestId?: string
  ): void;
  warn(
    message: string,
    metadata?: Record<string, unknown>,
    component?: string,
    requestId?: string
  ): void;
  error(
    message: string,
    error?: Error,
    metadata?: Record<string, unknown>,
    component?: string,
    requestId?: string
  ): void;
  setRequestId(requestId: string): void;
  getRequestId(): string;
}

// Configuration service interface
export interface IConfigService {
  initialize(): Promise<void>;
  getUserPreferences(): Promise<UserPreferences>;
  saveUserPreferences(preferences: UserPreferences): Promise<void>;
  getEffectivePreferences(projectPath: string): Promise<UserPreferences>;
}

// Health service interface
export interface IHealthService {
  healthCheckHandler: (req: any, res: any) => Promise<void>;
  readinessHandler: (req: any, res: any) => Promise<void>;
  livenessHandler: (req: any, res: any) => Promise<void>;
  getHealthStatus(): {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: Date;
    uptime: number;
    version: string;
    environment: string;
    checks: Array<{
      name: string;
      status: 'healthy' | 'unhealthy' | 'degraded';
      message?: string;
      responseTime?: number;
      lastChecked: Date;
    }>;
  };
}
