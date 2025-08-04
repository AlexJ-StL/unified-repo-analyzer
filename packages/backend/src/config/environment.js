import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
// Load environment-specific .env file
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
// Environment validation schema
const environmentSchema = z.object({
    // Server configuration
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    CORS_ORIGIN: z.string().default('*'),
    // Security
    JWT_SECRET: z.string().min(32).optional(),
    SESSION_SECRET: z.string().min(32).optional(),
    ENCRYPTION_KEY: z.string().length(32).optional(),
    // Storage paths
    DATA_DIR: z.string().default('./data'),
    CACHE_DIR: z.string().default('./data/cache'),
    INDEX_DIR: z.string().default('./data/index'),
    LOG_DIR: z.string().default('./logs'),
    // Cache configuration
    CACHE_TTL: z.coerce.number().default(3600),
    CACHE_MAX_SIZE: z.coerce.number().default(1000),
    // Rate limiting
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
    // File processing limits
    MAX_FILE_SIZE: z.coerce.number().default(10485760), // 10MB
    MAX_FILES_PER_REPO: z.coerce.number().default(10000),
    MAX_ANALYSIS_TIME: z.coerce.number().default(300000), // 5 minutes
    // LLM Provider API keys
    CLAUDE_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional(),
    // LLM Configuration
    DEFAULT_LLM_PROVIDER: z.string().default('claude'),
    LLM_TIMEOUT: z.coerce.number().default(30000),
    LLM_MAX_RETRIES: z.coerce.number().default(3),
    // Monitoring and Logging
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    ENABLE_METRICS: z.coerce.boolean().default(true),
    METRICS_PORT: z.coerce.number().default(9090),
    // Health check configuration
    HEALTH_CHECK_TIMEOUT: z.coerce.number().default(5000),
    HEALTH_CHECK_INTERVAL: z.coerce.number().default(30000),
    // Backup configuration
    BACKUP_ENABLED: z.coerce.boolean().default(true),
    BACKUP_INTERVAL: z.coerce.number().default(86400000), // 24 hours
    BACKUP_RETENTION_DAYS: z.coerce.number().default(30),
    BACKUP_DIR: z.string().default('./backups'),
});
// Validate and parse environment variables
const parseEnvironment = () => {
    try {
        return environmentSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
            throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`);
        }
        throw error;
    }
};
// Export validated environment configuration
export const env = parseEnvironment();
// Helper functions for environment checks
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';
// Secrets management helpers
export const getSecret = (key) => {
    return env[key];
};
export const requireSecret = (key) => {
    const value = getSecret(key);
    if (!value) {
        throw new Error(`Required secret ${key} is not configured`);
    }
    return value;
};
// Configuration validation for production
export const validateProductionConfig = () => {
    if (!isProduction())
        return;
    const requiredSecrets = ['JWT_SECRET', 'SESSION_SECRET', 'ENCRYPTION_KEY'];
    const missingSecrets = requiredSecrets.filter((secret) => !getSecret(secret));
    if (missingSecrets.length > 0) {
        throw new Error(`Missing required secrets for production: ${missingSecrets.join(', ')}\n` +
            'Please ensure all required environment variables are set.');
    }
    // Validate at least one LLM provider is configured
    const hasLLMProvider = env.CLAUDE_API_KEY || env.GEMINI_API_KEY || env.OPENROUTER_API_KEY;
    if (!hasLLMProvider) {
        console.warn('Warning: No LLM provider API keys configured. Some features may not work.');
    }
};
// Export environment for use in other modules
export default env;
//# sourceMappingURL=environment.js.map