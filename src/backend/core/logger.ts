import { config } from '../config';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  stack?: string;
}

class Logger {
  private level: LogLevel;
  private readonly levels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  constructor() {
    this.level = (config.LOG_LEVEL as LogLevel) || 'info';
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] <= this.levels[this.level];
  }

  private formatEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    const maskedContext = context ? this.maskSensitiveData(context) : undefined;
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: maskedContext,
    };
  }

  private maskSensitiveData(context: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = [
      'password',
      'secret',
      'key',
      'token',
      'apiKey',
      'api_key',
      'gemini_api_key',
      'openai_api_key',
      'google_ai_api_key',
      'jwt_secret',
      'jwt_refresh_secret',
      'authorization',
      'bearer',
      'api-key',
    ];
    const masked: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(context)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));
      
      if (isSensitive && typeof value === 'string') {
        masked[key] = '***';
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = this.maskSensitiveData(value as Record<string, unknown>);
      } else {
        masked[key] = value;
      }
    }
    
    return masked;
  }

  private output(entry: LogEntry): void {
    const output = config.LOG_PRETTY_PRINT
      ? JSON.stringify(entry, null, 2)
      : JSON.stringify(entry);
    
    if (entry.level === 'error') {
      console.error(output);
    } else if (entry.level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  error(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;
    
    const entry = this.formatEntry('error', message, context);
    if (context?.stack) {
      entry.stack = context.stack as string;
    }
    this.output(entry);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;
    this.output(this.formatEntry('warn', message, context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    this.output(this.formatEntry('info', message, context));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;
    this.output(this.formatEntry('debug', message, context));
  }

  child(context: Record<string, unknown>): Logger {
    const child = new Logger();
    child.setLevel(this.level);
    return {
      ...child,
      error: (msg: string, ctx?: Record<string, unknown>) => 
        this.error(msg, { ...context, ...ctx }),
      warn: (msg: string, ctx?: Record<string, unknown>) => 
        this.warn(msg, { ...context, ...ctx }),
      info: (msg: string, ctx?: Record<string, unknown>) => 
        this.info(msg, { ...context, ...ctx }),
      debug: (msg: string, ctx?: Record<string, unknown>) => 
        this.debug(msg, { ...context, ...ctx }),
    } as Logger;
  }
}

export const logger = new Logger();
