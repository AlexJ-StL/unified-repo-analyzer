/**
 * Service Container for dependency injection
 */

import type { ILogger, IConfigService, IHealthService } from '../types/services.js';
import { Logger } from '../services/logger.service.js';
import { ConfigurationService } from '../services/config.service.js';
import { HealthService } from '../services/health.service.js';

export class ServiceContainer {
  private _logger?: ILogger;
  private _configService?: IConfigService;
  private _healthService?: IHealthService;

  /**
   * Initialize all services in dependency order
   */
  async initialize(): Promise<void> {
    // Logger can be created first (only depends on static env)
    this._logger = new Logger();

    // Config service can be created next (uses static utils/logger)
    this._configService = new ConfigurationService();

    // Initialize config service
    await this._configService.initialize();

    // Health service depends on logger and env
    this._healthService = new HealthService(this._logger);
  }

  /**
   * Get the logger service
   */
  get logger(): ILogger {
    if (!this._logger) {
      throw new Error('ServiceContainer not initialized. Call initialize() first.');
    }
    return this._logger;
  }

  /**
   * Get the configuration service
   */
  get configService(): IConfigService {
    if (!this._configService) {
      throw new Error('ServiceContainer not initialized. Call initialize() first.');
    }
    return this._configService;
  }

  /**
   * Get the health service
   */
  get healthService(): IHealthService {
    if (!this._healthService) {
      throw new Error('ServiceContainer not initialized. Call initialize() first.');
    }
    return this._healthService;
  }
}

// Export singleton instance
export const serviceContainer = new ServiceContainer();