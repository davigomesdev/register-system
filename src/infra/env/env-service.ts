function env(key: string): string {
  const value: string | undefined = process.env[key];

  if (!value) {
    throw new Error(`${key} must be set`);
  }

  return value;
}

export interface IEnvService {
  getEnv(): string;
  getLogLevel(): string;
  getHost(): string;
  getPort(): number;
  getWebUrl(): string;
  getDatabaseHost(): string;
  getDatabasePort(): number;
  getDatabaseName(): string;
  getDatabaseUser(): string;
  getDatabasePassword(): string;
  getDatabaseSslMode(): string;
  getDatabaseTimezone(): string;
  getRedisDB(): number;
  getRedisHost(): string;
  getRedisPort(): number;
  getRedisPassword(): string;
  getJWTSecretKey(): string;
  getEncryptionKey(): string;
  getRefreshTokenSecretKey(): string;
}

export class EnvService implements IEnvService {
  private readonly env: string;
  private readonly logLevel: string;

  private readonly host: string;
  private readonly port: number;

  private readonly webUrl: string;

  private readonly databaseHost: string;
  private readonly databasePort: number;
  private readonly databaseName: string;
  private readonly databaseUser: string;
  private readonly databasePassword: string;
  private readonly databaseSslMode: string;
  private readonly databaseTimezone: string;

  private readonly redisDB: number;
  private readonly redisHost: string;
  private readonly redisPort: number;
  private readonly redisPassword: string;

  private readonly jwtSecretKey: string;
  private readonly encryptionKey: string;
  private readonly refreshTokenSecretKey: string;

  public constructor() {
    this.env = env('ENV');
    this.logLevel = env('LOG_LEVEL');

    this.host = env('HOST');
    this.port = Number(env('PORT'));

    this.webUrl = env('WEB_URL');

    this.databaseHost = env('DATABASE_HOST');
    this.databasePort = Number(env('DATABASE_PORT'));
    this.databaseName = env('DATABASE_NAME');
    this.databaseUser = env('DATABASE_USER');
    this.databasePassword = env('DATABASE_PASSWORD');
    this.databaseSslMode = env('DATABASE_SSLMODE');
    this.databaseTimezone = env('DATABASE_TIMEZONE');

    this.redisDB = Number(env('REDIS_DB'));
    this.redisHost = env('REDIS_HOST');
    this.redisPort = Number(env('REDIS_PORT'));
    this.redisPassword = process.env['REDIS_PASSWORD'] ?? '';

    this.jwtSecretKey = env('JWT_SECRET_KEY');
    this.encryptionKey = env('ENCRYPTION_KEY');
    this.refreshTokenSecretKey = env('REFRESH_TOKEN_SECRET_KEY');
  }

  public getEnv(): string {
    return this.env;
  }

  public getLogLevel(): string {
    return this.logLevel;
  }

  public getHost(): string {
    return this.host;
  }

  public getPort(): number {
    return this.port;
  }

  public getWebUrl(): string {
    return this.webUrl;
  }

  public getDatabaseHost(): string {
    return this.databaseHost;
  }

  public getDatabasePort(): number {
    return this.databasePort;
  }

  public getDatabaseName(): string {
    return this.databaseName;
  }

  public getDatabaseUser(): string {
    return this.databaseUser;
  }

  public getDatabasePassword(): string {
    return this.databasePassword;
  }

  public getDatabaseSslMode(): string {
    return this.databaseSslMode;
  }

  public getDatabaseTimezone(): string {
    return this.databaseTimezone;
  }

  public getRedisDB(): number {
    return this.redisDB;
  }

  public getRedisHost(): string {
    return this.redisHost;
  }

  public getRedisPort(): number {
    return this.redisPort;
  }

  public getRedisPassword(): string {
    return this.redisPassword;
  }

  public getJWTSecretKey(): string {
    return this.jwtSecretKey;
  }

  public getEncryptionKey(): string {
    return this.encryptionKey;
  }

  public getRefreshTokenSecretKey(): string {
    return this.refreshTokenSecretKey;
  }
}
