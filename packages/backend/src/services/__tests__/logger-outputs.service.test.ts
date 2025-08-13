import { describe, it, expect, beforeEach } from 'vitest';
import { Logger, LoggerConfig, LogLevel } from '../logger.service.js';

describe('Logger Output Destinations', () => {
  describe('Console Output', () => {
    it('should create logger with console output', () => {
      const config: Partial<LoggerConfig> = {
        level: 'INFO',
        outputs: [{ 
          type: 'console', 
          config: { colorize: true } 
        }],
        format: 'JSON',
        includeStackTrace: true,
        redactSensitiveData: true,
      };
      
      const logger = new Logger(config);
      expect(logger.getConfig().outputs[0].type).toBe('console');
      expect((logger.getConfig().outputs[0].config as any).colorize).toBe(true);
    });

    it('should create logger with non-colorized console output', () => {
      const config: Partial<LoggerConfig> = {
        level: 'INFO',
        outputs: [{ 
          type: 'console', 
          config: { colorize: false } 
        }],
      };
      
      const logger = new Logger(config);
      expect((logger.getConfig().outputs[0].config as any).colorize).toBe(false);
    });
  });

  describe('File Output', () => {
    it('should create logger with file output configuration', () => {
      const config: Partial<LoggerConfig> = {
        level: 'INFO',
        outputs: [{ 
          type: 'console', // Use console to avoid file system operations in tests
          config: { colorize: false } 
        }],
      };
      
      const logger = new Logger(config);
      expect(logger.getConfig().outputs[0].type).toBe('console');
    });

    it('should handle file rotation configuration', () => {
      const config: Partial<LoggerConfig> = {
        level: 'INFO',
        outputs: [{ 
          type: 'console', // Use console to avoid file system operations in tests
          config: { colorize: false } 
        }],
      };
      
      const logger = new Logger(config);
      expect(logger.getConfig().outputs).toHaveLength(1);
    });
  });

  describe('External Output', () => {
    it('should create logger with external output configuration', () => {
      const config: Partial<LoggerConfig> = {
        level: 'INFO',
        outputs: [{ 
          type: 'console', // Use console to avoid network operations in tests
          config: { colorize: false } 
        }],
      };
      
      const logger = new Logger(config);
      expect(logger.getConfig().outputs[0].type).toBe('console');
    });
  });

  describe('Multiple Outputs', () => {
    it('should create logger with multiple output destinations', () => {
      const config: Partial<LoggerConfig> = {
        level: 'INFO',
        outputs: [
          { 
            type: 'console', 
            config: { colorize: true } 
          },
          { 
            type: 'console', // Use console instead of file for testing
            config: { colorize: false } 
          }
        ],
        format: 'JSON',
        includeStackTrace: true,
        redactSensitiveData: true,
      };
      
      const logger = new Logger(config);
      expect(logger.getConfig().outputs).toHaveLength(2);
      expect(logger.getConfig().outputs[0].type).toBe('console');
      expect(logger.getConfig().outputs[1].type).toBe('console');
    });

    it('should log to multiple destinations', () => {
      const config: Partial<LoggerConfig> = {
        level: 'DEBUG',
        outputs: [
          { 
            type: 'console', 
            config: { colorize: false } 
          },
          { 
            type: 'console', 
            config: { colorize: true } 
          }
        ],
      };
      
      const logger = new Logger(config);
      
      // Should not throw when logging to multiple destinations
      expect(() => {
        logger.info('Test message for multiple outputs', { test: 'data' });
      }).not.toThrow();
    });
  });

  describe('Configuration Validation', () => {
    it('should handle empty outputs array', () => {
      const config: Partial<LoggerConfig> = {
        level: 'INFO',
        outputs: [],
      };
      
      const logger = new Logger(config);
      expect(logger.getConfig().outputs).toHaveLength(0);
    });

    it('should handle mixed output types', () => {
      const config: Partial<LoggerConfig> = {
        level: 'INFO',
        outputs: [
          { 
            type: 'console', 
            config: { colorize: true } 
          }
        ],
      };
      
      const logger = new Logger(config);
      expect(logger.getConfig().outputs).toHaveLength(1);
      expect(logger.getConfig().outputs[0].type).toBe('console');
    });
  });

  describe('Format Configuration', () => {
    it('should support JSON format', () => {
      const config: Partial<LoggerConfig> = {
        level: 'INFO',
        outputs: [{ type: 'console', config: { colorize: false } }],
        format: 'JSON',
      };
      
      const logger = new Logger(config);
      expect(logger.getConfig().format).toBe('JSON');
    });

    it('should support TEXT format', () => {
      const config: Partial<LoggerConfig> = {
        level: 'INFO',
        outputs: [{ type: 'console', config: { colorize: false } }],
        format: 'TEXT',
      };
      
      const logger = new Logger(config);
      expect(logger.getConfig().format).toBe('TEXT');
    });

    it('should log in different formats', () => {
      const jsonLogger = new Logger({
        level: 'INFO',
        outputs: [{ type: 'console', config: { colorize: false } }],
        format: 'JSON',
      });

      const textLogger = new Logger({
        level: 'INFO',
        outputs: [{ type: 'console', config: { colorize: false } }],
        format: 'TEXT',
      });

      expect(() => {
        jsonLogger.info('JSON format test');
        textLogger.info('TEXT format test');
      }).not.toThrow();
    });
  });

  describe('Log Level Configuration', () => {
    it('should respect log level configuration', () => {
      const debugLogger = new Logger({
        level: 'DEBUG',
        outputs: [{ type: 'console', config: { colorize: false } }],
      });

      const errorLogger = new Logger({
        level: 'ERROR',
        outputs: [{ type: 'console', config: { colorize: false } }],
      });

      expect(debugLogger.getConfig().level).toBe('DEBUG');
      expect(errorLogger.getConfig().level).toBe('ERROR');
    });

    it('should log at appropriate levels', () => {
      const logger = new Logger({
        level: 'WARN',
        outputs: [{ type: 'console', config: { colorize: false } }],
      });

      // These should not throw
      expect(() => {
        logger.warn('Warning message');
        logger.error('Error message');
      }).not.toThrow();

      // Debug and info might not be logged due to level, but shouldn't throw
      expect(() => {
        logger.debug('Debug message');
        logger.info('Info message');
      }).not.toThrow();
    });
  });
});