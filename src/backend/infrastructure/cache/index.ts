import { logger } from '../../core/logger';
import { config } from '../../config';

export interface CacheOptions {
  ttl?: number;
}

export interface CacheClient {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, options?: CacheOptions): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  flush(): Promise<void>;
}

abstract class Cache implements CacheClient {
  abstract get<T = unknown>(key: string): Promise<T | null>;
  abstract set<T = unknown>(key: string, value: T, options?: CacheOptions): Promise<void>;
  abstract del(key: string): Promise<void>;
  abstract exists(key: string): Promise<boolean>;
  abstract flush(): Promise<void>;
}

class MemoryCache extends Cache {
  private store: Map<string, { value: unknown; expiry: number }> = new Map();
  private defaultTTL: number = 3600;

  async get<T = unknown>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    
    return item.value as T;
  }

  async set<T = unknown>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl || this.defaultTTL;
    this.store.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.store.get(key);
    if (!item) return false;
    
    if (item.expiry < Date.now()) {
      this.store.delete(key);
      return false;
    }
    
    return true;
  }

  async flush(): Promise<void> {
    this.store.clear();
  }
}

class RedisCache extends Cache {
  private redis: unknown = null;

  async get<T = unknown>(_key: string): Promise<T | null> {
    logger.debug('Redis get');
    return null;
  }

  async set<T = unknown>(_key: string, _value: T, _options?: CacheOptions): Promise<void> {
    logger.debug('Redis set');
  }

  async del(_key: string): Promise<void> {
    logger.debug('Redis del');
  }

  async exists(_key: string): Promise<boolean> {
    logger.debug('Redis exists');
    return false;
  }

  async flush(): Promise<void> {
    logger.debug('Redis flush');
  }
}

let cacheClient: CacheClient | null = null;

export async function initializeCache(): Promise<CacheClient> {
  logger.info('Initializing cache client');
  
  if (config.REDIS_URL) {
    logger.info('Using Redis cache');
    cacheClient = new RedisCache();
  } else {
    logger.info('Using in-memory cache');
    cacheClient = new MemoryCache();
  }

  return cacheClient;
}

export function getCache(): CacheClient {
  if (!cacheClient) {
    throw new Error('Cache not initialized. Call initializeCache first.');
  }
  return cacheClient;
}

export const cache = {
  get: async <T = unknown>(key: string): Promise<T | null> => {
    return getCache().get<T>(key);
  },
  set: async <T = unknown>(key: string, value: T, options?: CacheOptions): Promise<void> => {
    return getCache().set(key, value, options);
  },
  del: async (key: string): Promise<void> => {
    return getCache().del(key);
  },
  remember: async <T = unknown>(
    key: string,
    fn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> => {
    const cached = await getCache().get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const value = await fn();
    await getCache().set(key, value, options);
    return value;
  },
};
