import { z } from 'zod';
import { zodConfig } from './zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: zodConfig.coerce.number().default(3000),
  
  DATABASE_URL: zodConfig.string().optional(),
  DATABASE_HOST: zodConfig.string().optional(),
  DATABASE_PORT: zodConfig.coerce.number().optional(),
  DATABASE_NAME: zodConfig.string().optional(),
  DATABASE_USER: zodConfig.string().optional(),
  DATABASE_PASSWORD: zodConfig.string().optional(),
  
  REDIS_URL: zodConfig.string().optional(),
  
  JWT_SECRET: zodConfig.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: zodConfig.string().default('7d'),
  JWT_REFRESH_SECRET: zodConfig.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: zodConfig.string().default('30d'),
  
  AI_PROVIDER: z.enum(['gemini', 'openai', 'mock']).default('mock'),
  GEMINI_API_KEY: zodConfig.string().optional(),
  OPENAI_API_KEY: zodConfig.string().optional(),

  RATE_LIMIT_MAX_REQUESTS: zodConfig.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: zodConfig.coerce.number().default(60000),
  
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_PRETTY_PRINT: zodConfig.coerce.boolean().default(false),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedConfig: EnvConfig | null = null;

function getRequiredEnvVars(): Record<string, string | undefined> {
  const env = process.env.NODE_ENV || 'development';
  const isProduction = env === 'production';
  
  return {
    JWT_SECRET: isProduction ? process.env.JWT_SECRET : process.env.JWT_SECRET || 'dev-secret-min-32-chars-do-not-use-in-prod',
    JWT_REFRESH_SECRET: isProduction ? process.env.JWT_REFRESH_SECRET : process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-min-32-chars-do-not-use',
  };
}

export function loadConfig(): EnvConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const required = getRequiredEnvVars();

  const result = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_PORT: process.env.DATABASE_PORT,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_USER: process.env.DATABASE_USER,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    
    REDIS_URL: process.env.REDIS_URL,
    
    JWT_SECRET: required.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_REFRESH_SECRET: required.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
    
    AI_PROVIDER: process.env.AI_PROVIDER || 'mock',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,

    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    
    LOG_LEVEL: process.env.LOG_LEVEL,
    LOG_PRETTY_PRINT: process.env.LOG_PRETTY_PRINT,
  });

  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  cachedConfig = result.data;
  return cachedConfig;
}

function maskApiKey(key: string | undefined): string {
  if (!key) return '';
  if (key.length <= 8) return '***';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}

export const config = loadConfig();

export const aiConfig = {
  provider: config.AI_PROVIDER as 'gemini' | 'openai' | 'mock',
  geminiApiKey: config.GEMINI_API_KEY || '',
  openaiApiKey: config.OPENAI_API_KEY || '',
  isGeminiConfigured: !!config.GEMINI_API_KEY,
  isOpenAIConfigured: !!config.OPENAI_API_KEY,
  isConfigured: !!config.GEMINI_API_KEY,
  getMaskedGeminiKey: () => maskApiKey(config.GEMINI_API_KEY),
  getMaskedOpenAIKey: () => maskApiKey(config.OPENAI_API_KEY),
};

export const dbConfig = {
  url: config.DATABASE_URL || '',
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,
  database: config.DATABASE_NAME,
  user: config.DATABASE_USER,
  password: config.DATABASE_PASSWORD,
  isConfigured: !!config.DATABASE_URL || !!config.DATABASE_HOST,
};

export const authConfig = {
  jwtSecret: config.JWT_SECRET,
  jwtRefreshSecret: config.JWT_REFRESH_SECRET,
  expiresIn: config.JWT_EXPIRES_IN,
  refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN,
};

export const redisConfig = {
  url: config.REDIS_URL || '',
  isConfigured: !!config.REDIS_URL,
};

export function validateAIConfig(): { valid: boolean; error?: string } {
  const provider = config.AI_PROVIDER;

  if (provider === 'gemini' && !config.GEMINI_API_KEY) {
    return { valid: false, error: 'GEMINI_API_KEY is required when AI_PROVIDER is set to "gemini"' };
  }

  if (provider === 'openai' && !config.OPENAI_API_KEY) {
    return { valid: false, error: 'OPENAI_API_KEY is required when AI_PROVIDER is set to "openai"' };
  }

  return { valid: true };
}
