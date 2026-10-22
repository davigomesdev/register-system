import type { PoolClient } from 'pg';
import type { IEnvService } from '../env/env-service.js';
import type { FastifyBaseLogger } from 'fastify';

import { Pool } from 'pg';

export interface IPersistenceService {
  getPool(): Pool;
  begin<T>(fn: (executor: PoolClient) => Promise<T>): Promise<T>;
}

export class PersistenceService implements IPersistenceService {
  private readonly pool: Pool;

  public constructor(loggerService: FastifyBaseLogger, envService: IEnvService) {
    const logger: FastifyBaseLogger = loggerService.child({ context: 'PersistenceService' });

    this.pool = new Pool({
      host: envService.getDatabaseHost(),
      port: envService.getDatabasePort(),
      database: envService.getDatabaseName(),
      user: envService.getDatabaseUser(),
      password: envService.getDatabasePassword(),
      ssl: envService.getDatabaseSslMode() === 'require',
      options: `-c timezone=${envService.getDatabaseTimezone()}`,
      max: 20,
      connectionTimeoutMillis: 3_000,
      idleTimeoutMillis: 600_000,
      maxUses: 7_500,
    });

    this.pool.on('error', (err: Error): void => {
      logger.error({ err }, 'postgres pool error');
    });
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async begin<T>(fn: (tx: PoolClient) => Promise<T>): Promise<T> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result: Awaited<T> = await fn(client);
      await client.query('COMMIT');

      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
