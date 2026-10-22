import type { IEnvService } from '../env/env-service.js';
import type { FastifyBaseLogger } from 'fastify';

import { Redis } from 'ioredis';

export interface ICacheService {
  getClient(): Redis;
  disconnect(): Promise<void>;
}

export class CacheService implements ICacheService {
  private readonly client: Redis;

  public constructor(loggerService: FastifyBaseLogger, envService: IEnvService) {
    const logger: FastifyBaseLogger = loggerService.child({ context: 'CacheService' });

    this.client = new Redis({
      host: envService.getRedisHost(),
      port: envService.getRedisPort(),
      db: envService.getRedisDB(),
      password: envService.getRedisPassword() || undefined,
      connectTimeout: 500,
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.client.on('ready', (): void => {
      logger.info('redis ready');
    });

    this.client.on('reconnecting', (): void => {
      logger.warn('redis reconnecting');
    });

    this.client.on('error', (err: Error): void => {
      logger.error({ err }, 'redis error');
    });
  }

  public getClient(): Redis {
    return this.client;
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
