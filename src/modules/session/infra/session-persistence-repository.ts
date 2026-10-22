import type { SessionRow } from './session-model.js';
import type { SessionEntity } from '../domain/session-entity.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';
import type { PoolClient, QueryResult } from 'pg';
import type { SessionRepository, SessionSearchParams } from '../domain/session-repository.js';

import { DatabaseError as PgDatabaseError } from 'pg';

import { ConflictError } from '#src/domain/errors/conflict-error.js';
import { DatabaseError } from '#src/domain/errors/database-error.js';
import { NotFoundError } from '#src/domain/errors/not-found-error.js';
import { ForbiddenError } from '#src/domain/errors/forbidden-error.js';

import { SessionModel } from './session-model.js';
import { SESSION_SORT_COLUMN, SessionSearchResult } from '../domain/session-repository.js';

export class SessionPersistenceRepository implements SessionRepository {
  private readonly persistenceService: IPersistenceService;

  public constructor(persistenceService: IPersistenceService) {
    this.persistenceService = persistenceService;
  }

  public async getByIdAndUserId(id: bigint, userId: bigint): Promise<SessionEntity> {
    const result: QueryResult<SessionRow> = await this.persistenceService
      .getPool()
      .query<SessionRow>(`SELECT * FROM sessions WHERE id = $1 AND user_id = $2`, [id, userId])
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    if (!result.rows[0]) {
      throw new NotFoundError('session not found');
    }

    return SessionModel.toEntity(result.rows[0]);
  }

  public async getByRefreshTokenHash(refreshTokenHash: string): Promise<SessionEntity> {
    const result: QueryResult<SessionRow> = await this.persistenceService
      .getPool()
      .query<SessionRow>(`SELECT * FROM sessions WHERE refresh_token_hash = $1`, [refreshTokenHash])
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    if (!result.rows[0]) {
      throw new ForbiddenError();
    }

    return SessionModel.toEntity(result.rows[0]);
  }

  public async search(params: SessionSearchParams): Promise<SessionSearchResult> {
    const activeOnly: boolean = params.filter.activeOnly ?? true;

    const rows: QueryResult<SessionRow> = await this.persistenceService
      .getPool()
      .query<SessionRow>(
        `SELECT *
         FROM sessions
         WHERE ($1::bigint IS NULL OR user_id = $1)
             AND ($2::bigint IS NULL OR family_id = $2)
             AND ($3::boolean = false OR (revoked_at IS NULL AND expires_at > NOW()))
         ORDER BY ${SESSION_SORT_COLUMN[params.sort]} ${params.sortDir}, id
         LIMIT $4 OFFSET $5`,
        [params.filter.userId ?? null, params.filter.familyId ?? null, activeOnly, params.perPage, params.offset()],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    const count: QueryResult<{ total: number }> = await this.persistenceService
      .getPool()
      .query<{ total: number }>(
        `SELECT COUNT(*)::int AS total
         FROM sessions
         WHERE ($1::bigint IS NULL OR user_id = $1)
             AND ($2::bigint IS NULL OR family_id = $2)
             AND ($3::boolean = false OR (revoked_at IS NULL AND expires_at > NOW()))
        `,
        [params.filter.userId ?? null, params.filter.familyId ?? null, activeOnly],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    return new SessionSearchResult(
      rows.rows.map((row: SessionRow): SessionEntity => SessionModel.toEntity(row)),
      count.rows[0]?.total ?? 0,
      params,
    );
  }

  public async createTx(tx: PoolClient, session: SessionEntity): Promise<void> {
    await tx
      .query(
        `INSERT INTO sessions (
            id,
            user_id,
            family_id,
            parent_id,
            refresh_token_hash,
            ip_address,
            user_agent,
            device_info,
            last_used_at,
            revoked_at,
            expires_at,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          session.id,
          session.userId,
          session.familyId,
          session.parentId,
          session.refreshTokenHash,
          session.ipAddress,
          session.userAgent,
          session.deviceInfo,
          session.lastUsedAt,
          session.revokedAt,
          session.expiresAt,
          session.createdAt,
          session.updatedAt,
        ],
      )
      .catch((error: unknown) => {
        if (error instanceof PgDatabaseError && error.constraint === 'uq_sessions_refresh_token_hash') {
          throw new ConflictError('refresh token already exists');
        }

        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }

  public async updateTx(tx: PoolClient, session: SessionEntity): Promise<void> {
    await tx
      .query(
        `UPDATE sessions
         SET last_used_at = $2,
             revoked_at = $3,
             expires_at = $4,
             updated_at = $5
         WHERE id = $1`,
        [session.id, session.lastUsedAt, session.revokedAt, session.expiresAt, session.updatedAt],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }

  public async revokeTx(tx: PoolClient, session: SessionEntity): Promise<void> {
    await tx
      .query(
        `UPDATE sessions
         SET revoked_at = $2,
             updated_at = $3
         WHERE id = $1`,
        [session.id, session.revokedAt, session.updatedAt],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }

  public async revokeByFamilyIdTx(tx: PoolClient, familyId: bigint): Promise<void> {
    await tx
      .query(
        `UPDATE sessions
         SET revoked_at = NOW(),
             updated_at = NOW()
         WHERE family_id = $1
           AND revoked_at IS NULL`,
        [familyId],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }

  public async revokeAllByUserIdTx(tx: PoolClient, userId: bigint): Promise<void> {
    await tx
      .query(
        `UPDATE sessions
         SET revoked_at = NOW(),
             updated_at = NOW()
         WHERE user_id = $1
           AND revoked_at IS NULL`,
        [userId],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }
}
