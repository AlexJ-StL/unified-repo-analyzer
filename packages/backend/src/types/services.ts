/**
 * Service interfaces for dependency injection
 */

import type { UserPreferences } from '@unified-repo-analyzer/shared';
import type { Request, Response } from 'express';

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
  healthCheckHandler: (req: Request, res: Response) => Promise<void>;
  readinessHandler: (req: Request, res: Response) => Promise<void>;
  livenessHandler: (req: Request, res: Response) => Promise<void>;
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
