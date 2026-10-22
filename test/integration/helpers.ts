import type { Pool } from 'pg';
import type { IEnvService } from '#src/infra/env/env-service.js';

import pino from 'pino';
import { EnvService } from '#src/infra/env/env-service.js';
import { PersistenceService } from '#src/infra/persistence/persistence-service.js';
import { EncryptionService } from '#src/infra/encryption/encryption-service.js';

/** True when integration env vars are present (docker-compose up + --env-file). */
export function hasIntegrationDb(): boolean {
  return Boolean(process.env.DATABASE_HOST && process.env.DATABASE_NAME && process.env.DATABASE_USER);
}

export function createIntegrationEnv(): IEnvService {
  return new EnvService();
}

export function createIntegrationPersistence(envService: IEnvService): PersistenceService {
  const logger = pino({ level: 'silent' });
  return new PersistenceService(logger, envService);
}

export function createIntegrationEncryption(envService: IEnvService): EncryptionService {
  return new EncryptionService(envService);
}

export async function cleanupCustomer(pool: Pool, id: bigint): Promise<void> {
  await pool.query(`DELETE FROM customers WHERE id = $1`, [id]);
}

export async function cleanupProduct(pool: Pool, id: bigint): Promise<void> {
  await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
}

export async function cleanupUser(pool: Pool, id: bigint): Promise<void> {
  await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [id]);
  await pool.query(`DELETE FROM audit_logs WHERE actor_id = $1 OR resource_id = $1`, [id]);
  await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
}

export async function cleanupSession(pool: Pool, id: bigint): Promise<void> {
  await pool.query(`DELETE FROM sessions WHERE id = $1`, [id]);
}

export async function cleanupAuditLog(pool: Pool, id: bigint): Promise<void> {
  await pool.query(`DELETE FROM audit_logs WHERE id = $1`, [id]);
}
