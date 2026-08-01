import { logger } from '../../core/logger';
import { dbConfig } from '../../config';

export interface DatabaseConfig {
  url?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
}

export interface ConnectionPool {
  getConnection(): Promise<unknown>;
  releaseConnection(connection: unknown): void;
  end(): Promise<void>;
}

abstract class DatabaseClient {
  protected pool: ConnectionPool | null = null;
  protected isConnected: boolean = false;

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract query<T = unknown>(sql: string, params?: unknown[]): Promise<T>;
  abstract transaction<T>(fn: () => Promise<T>): Promise<T>;

  isReady(): boolean {
    return this.isConnected;
  }
}

class MockDatabaseClient extends DatabaseClient {
  private data: Map<string, unknown[]> = new Map();

  async connect(): Promise<void> {
    logger.info('Connecting to mock database');
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    logger.info('Disconnecting from mock database');
    this.isConnected = false;
  }

  async query<T = unknown>(_sql: string, _params?: unknown[]): Promise<T> {
    return [] as T;
  }

  async transaction<T>(_fn: () => Promise<T>): Promise<T> {
    return {} as T;
  }

  setData(key: string, data: unknown[]): void {
    this.data.set(key, data);
  }

  getData(key: string): unknown[] {
    return this.data.get(key) || [];
  }
}

let databaseClient: DatabaseClient | null = null;

export async function initializeDatabase(config?: DatabaseConfig): Promise<DatabaseClient> {
  const finalConfig = config || {
    url: dbConfig.url,
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    password: dbConfig.password,
  };

  logger.info('Initializing database client', { 
    hasUrl: !!finalConfig.url,
    hasHost: !!finalConfig.host,
    masked: true 
  });
  
  if (finalConfig.url || finalConfig.host) {
    logger.info('Using PostgreSQL database');
    databaseClient = new PostgresDatabaseClient(finalConfig);
  } else {
    logger.info('Using mock database - no DATABASE_URL configured');
    databaseClient = new MockDatabaseClient();
  }

  await databaseClient.connect();
  return databaseClient;
}

export function getDatabase(): DatabaseClient {
  if (!databaseClient) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return databaseClient;
}

class PostgresDatabaseClient extends DatabaseClient {
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    super();
    this.config = config;
  }

  async connect(): Promise<void> {
    logger.info('PostgreSQL connection would be established here');
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    logger.info('PostgreSQL disconnection');
    this.isConnected = false;
  }

  async query<T = unknown>(_sql: string, _params?: unknown[]): Promise<T> {
    logger.debug('PostgreSQL query', { sql: _sql, params: _params });
    return [] as T;
  }

  async transaction<T>(_fn: () => Promise<T>): Promise<T> {
    logger.debug('PostgreSQL transaction');
    return {} as T;
  }
}
