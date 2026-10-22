import type { AuditLogRow } from './audit-log-model.js';
import type { AuditLogEntity } from '../domain/audit-log-entity.js';
import type { IEncryptionService } from '#src/infra/encryption/encryption-service.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';
import type { PoolClient, QueryResult } from 'pg';
import type { AuditLogOption, AuditLogRepository, AuditLogSearchParams } from '../domain/audit-log-repository.js';

import { JSONStringify } from 'json-with-bigint';
import { DatabaseError as PgDatabaseError } from 'pg';

import { DatabaseError } from '#src/domain/errors/database-error.js';
import { NotFoundError } from '#src/domain/errors/not-found-error.js';
import { BadRequestError } from '#src/domain/errors/bad-request-error.js';

import { AuditLogModel } from './audit-log-model.js';
import { AUDIT_LOG_SORT_COLUMN, AuditLogSearchResult } from '../domain/audit-log-repository.js';

export class AuditLogPersistenceRepository implements AuditLogRepository {
  private readonly encryptionService: IEncryptionService;
  private readonly persistenceService: IPersistenceService;

  public constructor(encryptionService: IEncryptionService, persistenceService: IPersistenceService) {
    this.encryptionService = encryptionService;
    this.persistenceService = persistenceService;
  }

  public async get(id: bigint, options?: AuditLogOption): Promise<AuditLogEntity> {
    const result: QueryResult<AuditLogRow> = await this.persistenceService
      .getPool()
      .query<AuditLogRow>(
        options?.actor === true
          ? `SELECT t0.*, to_jsonb(t1) AS actor
            FROM audit_logs t0
            LEFT JOIN users t1 ON t0.actor_type = 'USER' AND t1.id = t0.actor_id
            WHERE t0.id = $1`
          : `SELECT * FROM audit_logs WHERE id = $1`,
        [id],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    if (!result.rows[0]) {
      throw new NotFoundError('audit log not found');
    }

    return AuditLogModel.toEntity(result.rows[0], this.encryptionService);
  }

  public async search(params: AuditLogSearchParams): Promise<AuditLogSearchResult> {
    const rows: QueryResult<AuditLogRow> = await this.persistenceService
      .getPool()
      .query<AuditLogRow>(
        params.options?.actor === true
          ? `SELECT t0.*, to_jsonb(t1) AS actor
            FROM audit_logs t0
            LEFT JOIN users t1 ON t0.actor_type = 'USER' AND t1.id = t0.actor_id
            WHERE ($1::bigint IS NULL OR t0.actor_id = $1)
                AND ($2::bigint IS NULL OR t0.resource_id = $2)
                AND ($3::varchar IS NULL OR t0.action = $3)
                AND ($4::varchar IS NULL OR t0.resource = $4)
           ORDER BY t0.${AUDIT_LOG_SORT_COLUMN[params.sort]} ${params.sortDir}, t0.id
           LIMIT $5 OFFSET $6`
          : `SELECT *
            FROM audit_logs
            WHERE ($1::bigint IS NULL OR actor_id = $1)
                AND ($2::bigint IS NULL OR resource_id = $2)
                AND ($3::varchar IS NULL OR action = $3)
                AND ($4::varchar IS NULL OR resource = $4)
           ORDER BY ${AUDIT_LOG_SORT_COLUMN[params.sort]} ${params.sortDir}, id
           LIMIT $5 OFFSET $6`,
        [params.filter.actorId, params.filter.resourceId, params.filter.action, params.filter.resource, params.perPage, params.offset()],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    const count: QueryResult<{ total: string }> = await this.persistenceService
      .getPool()
      .query<{ total: string }>(
        `SELECT COUNT(*) AS total
        FROM audit_logs
        WHERE ($1::bigint IS NULL OR actor_id = $1)
            AND ($2::bigint IS NULL OR resource_id = $2)
            AND ($3::varchar IS NULL OR action = $3)
            AND ($4::varchar IS NULL OR resource = $4)`,
        [params.filter.actorId, params.filter.resourceId, params.filter.action, params.filter.resource],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    return new AuditLogSearchResult(
      rows.rows.map((row: AuditLogRow): AuditLogEntity => AuditLogModel.toEntity(row, this.encryptionService)),
      Number(count.rows[0]?.total ?? 0),
      params,
    );
  }

  public async createTx(tx: PoolClient, auditLog: AuditLogEntity): Promise<void> {
    await tx
      .query(
        `INSERT INTO audit_logs (
                id,
                actor_id,
                resource_id,
                actor_type,
                action,
                resource,
                before,
                after,
                ip_address,
                user_agent,
                metadata,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          auditLog.id,
          auditLog.actorId,
          auditLog.resourceId,
          auditLog.actorType,
          auditLog.action,
          auditLog.resource,
          auditLog.before === null ? null : JSONStringify(auditLog.before),
          auditLog.after === null ? null : JSONStringify(auditLog.after),
          auditLog.ipAddress,
          auditLog.userAgent,
          auditLog.metadata === null ? null : JSONStringify(auditLog.metadata),
          auditLog.createdAt,
        ],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }

  public async createBatchTx(tx: PoolClient, auditLogs: AuditLogEntity[]): Promise<void> {
    if (auditLogs.length === 0) {
      return;
    }

    const columns: number = 12;
    const placeholders: string = auditLogs
      .map((_: AuditLogEntity, index: number) => `(${Array.from({ length: columns }, (_: unknown, i: number) => `$${index * columns + i + 1}`).join(', ')})`)
      .join(', ');

    await tx
      .query(
        `INSERT INTO audit_logs (
          id,
          actor_id,
          resource_id,
          actor_type,
          action,
          resource,
          before,
          after,
          ip_address,
          user_agent,
          metadata,
          created_at
      )
      VALUES ${placeholders}`,
        auditLogs.flatMap((auditLog: AuditLogEntity) => [
          auditLog.id,
          auditLog.actorId,
          auditLog.resourceId,
          auditLog.actorType,
          auditLog.action,
          auditLog.resource,
          auditLog.before === null ? null : JSONStringify(auditLog.before),
          auditLog.after === null ? null : JSONStringify(auditLog.after),
          auditLog.ipAddress,
          auditLog.userAgent,
          auditLog.metadata === null ? null : JSONStringify(auditLog.metadata),
          auditLog.createdAt,
        ]),
      )
      .catch((error: unknown) => {
        if (error instanceof PgDatabaseError && error.code === '23514') {
          throw new BadRequestError('actor_id is required when actor_type is "USER"');
        }

        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }
}
