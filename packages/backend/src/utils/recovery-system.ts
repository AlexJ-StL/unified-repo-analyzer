/**
 * Error recovery and graceful degradation system
 */

import { EventEmitter } from 'node:events';
import logger from '../services/logger.service.js';
import {
  createEnhancedError,
  type EnhancedError,
  ErrorCategory,
  ErrorSeverity,
} from './error-handler.js';
import { enhancedLogger } from './logging-enhancer.js';

/**
 * Recovery strategy types
 */
export enum RecoveryStrategy {
  RETRY = 'RETRY',
  FALLBACK = 'FALLBACK',
  CIRCUIT_BREAKER = 'CIRCUIT_BREAKER',
  GRACEFUL_DEGRADATION = 'GRACEFUL_DEGRADATION',
  FAIL_FAST = 'FAIL_FAST',
}

/**
 * Recovery configuration
 */
export interface RecoveryConfig {
  strategy: RecoveryStrategy;
  maxRetries?: number;
  retryDelay?: number;
  fallbackValue?: any;
  fallbackFunction?: () => Promise<any>;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeout?: number;
  healthCheckFunction?: () => Promise<boolean>;
}

/**
 * Recovery attempt result
 */
export interface RecoveryResult<T> {
  success: boolean;
  result?: T;
  error?: EnhancedError;
  strategy: RecoveryStrategy;
  attempts: number;
  totalDuration: number;
}

/**
 * System health status
 */
export interface SystemHealth {
  overall: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  components: Map<string, ComponentHealth>;
  lastCheck: Date;
}

export interface ComponentHealth {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  lastCheck: Date;
  errorCount: number;
  lastError?: string;
  responseTime?: number;
}

/**
 * Recovery system class
 */
export class RecoverySystem extends EventEmitter {
  private componentHealth = new Map<string, ComponentHealth>();
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private recoveryAttempts = new Map<string, number>();

  constructor() {
    super();
    this.startHealthMonitoring();
  }

  /**
   * Execute operation with recovery strategy
   */
  async executeWithRecovery<T>(
    operationName: string,
    operation: () => Promise<T>,
    config: RecoveryConfig
  ): Promise<RecoveryResult<T>> {
    const operationId = enhancedLogger.startOperation('recovery-operation', {
      operationName,
      strategy: config.strategy,
    });

    const startTime = Date.now();
    const attempts = 0;
    let lastError: EnhancedError;

    try {
      switch (config.strategy) {
        case RecoveryStrategy.RETRY:
          return await this.executeWithRetry(operationName, operation, config, attempts);

        case RecoveryStrategy.FALLBACK:
          return await this.executeWithFallback(operationName, operation, config);

        case RecoveryStrategy.CIRCUIT_BREAKER:
          return await this.executeWithCircuitBreaker(operationName, operation, config);

        case RecoveryStrategy.GRACEFUL_DEGRADATION:
          return await this.executeWithGracefulDegradation(operationName, operation, config);

        case RecoveryStrategy.FAIL_FAST:
          return await this.executeFailFast(operationName, operation);

        default:
          throw createEnhancedError(
            ErrorCategory.INTERNAL,
            ErrorSeverity.HIGH,
            `Unknown recovery strategy: ${config.strategy}`,
            500
          );
      }
    } catch (error) {
      lastError = error as EnhancedError;

      enhancedLogger.endOperation(operationId, false, undefined, lastError);

      return {
        success: false,
        error: lastError,
        strategy: config.strategy,
        attempts,
        totalDuration: Date.now() - startTime,
      };
    } finally {
      enhancedLogger.endOperation(operationId, true);
    }
  }

  /**
   * Execute with retry strategy
   */
  private async executeWithRetry<T>(
    operationName: string,
    operation: () => Promise<T>,
    config: RecoveryConfig,
    attempts: number
  ): Promise<RecoveryResult<T>> {
    const maxRetries = config.maxRetries || 3;
    const retryDelay = config.retryDelay || 1000;
    const startTime = Date.now();
    let lastError: EnhancedError;

    for (attempts = 1; attempts <= maxRetries; attempts++) {
      try {
        const result = await operation();

        // Reset failure count on success
        this.recoveryAttempts.delete(operationName);

        return {
          success: true,
          result,
          strategy: RecoveryStrategy.RETRY,
          attempts,
          totalDuration: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error as EnhancedError;

        logger.warn(`Operation ${operationName} failed, attempt ${attempts}/${maxRetries}`, {
          error: lastError.message,
          attempt: attempts,
          maxRetries,
        });

        if (attempts < maxRetries) {
          // Exponential backoff
          const delay = retryDelay * 2 ** (attempts - 1);
          await this.delay(delay);
        }
      }
    }

    // Track consecutive failures
    const currentFailures = this.recoveryAttempts.get(operationName) || 0;
    this.recoveryAttempts.set(operationName, currentFailures + 1);

    throw lastError!;
  }

  /**
   * Execute with fallback strategy
   */
  private async executeWithFallback<T>(
    operationName: string,
    operation: () => Promise<T>,
    config: RecoveryConfig
  ): Promise<RecoveryResult<T>> {
    const startTime = Date.now();

    try {
      const result = await operation();
      return {
        success: true,
        result,
        strategy: RecoveryStrategy.FALLBACK,
        attempts: 1,
        totalDuration: Date.now() - startTime,
      };
    } catch (error) {
      logger.warn(`Operation ${operationName} failed, using fallback`, {
        error: (error as Error).message,
      });

      let fallbackResult: T;

      if (config.fallbackFunction) {
        fallbackResult = await config.fallbackFunction();
      } else if (config.fallbackValue !== undefined) {
        fallbackResult = config.fallbackValue;
      } else {
        throw error;
      }

      return {
        success: true,
        result: fallbackResult,
        strategy: RecoveryStrategy.FALLBACK,
        attempts: 1,
        totalDuration: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute with circuit breaker strategy
   */
  private async executeWithCircuitBreaker<T>(
    operationName: string,
    operation: () => Promise<T>,
    config: RecoveryConfig
  ): Promise<RecoveryResult<T>> {
    const startTime = Date.now();
    const circuitBreaker = this.getOrCreateCircuitBreaker(operationName, config);

    // Check if circuit is open
    if (circuitBreaker.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - circuitBreaker.lastFailureTime;
      const timeout = config.circuitBreakerTimeout || 60000;

      if (timeSinceLastFailure < timeout) {
        throw createEnhancedError(
          ErrorCategory.EXTERNAL_SERVICE,
          ErrorSeverity.HIGH,
          `Circuit breaker is OPEN for ${operationName}`,
          503
        );
      }
      // Try to half-open the circuit
      circuitBreaker.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();

      // Success - close the circuit
      circuitBreaker.state = 'CLOSED';
      circuitBreaker.failures = 0;

      return {
        success: true,
        result,
        strategy: RecoveryStrategy.CIRCUIT_BREAKER,
        attempts: 1,
        totalDuration: Date.now() - startTime,
      };
    } catch (error) {
      // Failure - increment failure count
      circuitBreaker.failures++;
      circuitBreaker.lastFailureTime = Date.now();

      const threshold = config.circuitBreakerThreshold || 5;
      if (circuitBreaker.failures >= threshold) {
        circuitBreaker.state = 'OPEN';
        logger.error(`Circuit breaker opened for ${operationName}`, {
          failures: circuitBreaker.failures,
          threshold,
        });
      }

      throw error;
    }
  }

  /**
   * Execute with graceful degradation
   */
  private async executeWithGracefulDegradation<T>(
    operationName: string,
    operation: () => Promise<T>,
    config: RecoveryConfig
  ): Promise<RecoveryResult<T>> {
    const startTime = Date.now();

    try {
      const result = await operation();
      return {
        success: true,
        result,
        strategy: RecoveryStrategy.GRACEFUL_DEGRADATION,
        attempts: 1,
        totalDuration: Date.now() - startTime,
      };
    } catch (error) {
      // Mark component as degraded
      this.updateComponentHealth(operationName, 'DEGRADED', error as Error);

      logger.warn(`Operation ${operationName} failed, system degraded`, {
        error: (error as Error).message,
      });

      // Return partial functionality or cached data
      let degradedResult: T;

      if (config.fallbackFunction) {
        degradedResult = await config.fallbackFunction();
      } else if (config.fallbackValue !== undefined) {
        degradedResult = config.fallbackValue;
      } else {
        // Return empty/default result for graceful degradation
        degradedResult = {} as T;
      }

      return {
        success: true,
        result: degradedResult,
        strategy: RecoveryStrategy.GRACEFUL_DEGRADATION,
        attempts: 1,
        totalDuration: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute with fail-fast strategy
   */
  private async executeFailFast<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<RecoveryResult<T>> {
    const startTime = Date.now();

    try {
      const result = await operation();
      return {
        success: true,
        result,
        strategy: RecoveryStrategy.FAIL_FAST,
        attempts: 1,
        totalDuration: Date.now() - startTime,
      };
    } catch (error) {
      // Immediately fail without any recovery attempts
      throw error;
    }
  }

  /**
   * Register component for health monitoring
   */
  registerComponent(name: string, healthCheck: () => Promise<boolean>): void {
    this.componentHealth.set(name, {
      name,
      status: 'HEALTHY',
      lastCheck: new Date(),
      errorCount: 0,
    });

    // Perform initial health check
    this.checkComponentHealth(name, healthCheck);
  }

  /**
   * Get system health status
   */
  getSystemHealth(): SystemHealth {
    const components = new Map(this.componentHealth);

    let overall: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' = 'HEALTHY';
    let unhealthyCount = 0;
    let degradedCount = 0;

    for (const component of components.values()) {
      if (component.status === 'UNHEALTHY') {
        unhealthyCount++;
      } else if (component.status === 'DEGRADED') {
        degradedCount++;
      }
    }

    if (unhealthyCount > 0) {
      overall = 'UNHEALTHY';
    } else if (degradedCount > 0) {
      overall = 'DEGRADED';
    }

    return {
      overall,
      components,
      lastCheck: new Date(),
    };
  }

  /**
   * Update component health status
   */
  private updateComponentHealth(
    componentName: string,
    status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY',
    error?: Error
  ): void {
    const component = this.componentHealth.get(componentName) || {
      name: componentName,
      status: 'HEALTHY',
      lastCheck: new Date(),
      errorCount: 0,
    };

    component.status = status;
    component.lastCheck = new Date();

    if (error) {
      component.errorCount++;
      component.lastError = error.message;
    }

    this.componentHealth.set(componentName, component);
    this.emit('healthChanged', componentName, status);
  }

  /**
   * Check individual component health
   */
  private async checkComponentHealth(
    componentName: string,
    healthCheck: () => Promise<boolean>
  ): Promise<void> {
    try {
      const startTime = Date.now();
      const isHealthy = await healthCheck();
      const responseTime = Date.now() - startTime;

      const component = this.componentHealth.get(componentName);
      if (component) {
        component.responseTime = responseTime;
        component.lastCheck = new Date();
        component.status = isHealthy ? 'HEALTHY' : 'DEGRADED';
        this.componentHealth.set(componentName, component);
      }
    } catch (error) {
      this.updateComponentHealth(componentName, 'UNHEALTHY', error as Error);
    }
  }

  /**
   * Get or create circuit breaker state
   */
  private getOrCreateCircuitBreaker(
    operationName: string,
    config: RecoveryConfig
  ): CircuitBreakerState {
    if (!this.circuitBreakers.has(operationName)) {
      this.circuitBreakers.set(operationName, {
        state: 'CLOSED',
        failures: 0,
        lastFailureTime: 0,
      });
    }
    return this.circuitBreakers.get(operationName)!;
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    // Check component health every 30 seconds
    setInterval(() => {
      for (const [name, component] of this.componentHealth.entries()) {
        // Skip if no health check function is available
        // In a real implementation, you'd store the health check functions
      }
    }, 30000);

    // Clean up old recovery attempts every 5 minutes
    setInterval(
      () => {
        this.recoveryAttempts.clear();
      },
      5 * 60 * 1000
    );
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Circuit breaker state
 */
interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  lastFailureTime: number;
}

// Export singleton instance
export const recoverySystem = new RecoverySystem();

/**
 * Decorator for automatic recovery
 */
export function withRecovery(config: RecoveryConfig) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const operationName = `${target.constructor.name}.${propertyName}`;

      const result = await recoverySystem.executeWithRecovery(
        operationName,
        () => method.apply(this, args),
        config
      );

      if (!result.success) {
        throw result.error;
      }

      return result.result;
    };

    return descriptor;
  };
}
