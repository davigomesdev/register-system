import type { UserRow } from './user-model.js';
import type { UserEntity } from '#src/modules/user/domain/user-entity.js';
import type { IEncryptionService } from '#src/infra/encryption/encryption-service.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';
import type { PoolClient, QueryResult } from 'pg';
import type { UserRepository, UserSearchParams } from '#src/modules/user/domain/user-repository.js';

import { DatabaseError as PgDatabaseError } from 'pg';

import { ConflictError } from '#src/domain/errors/conflict-error.js';
import { DatabaseError } from '#src/domain/errors/database-error.js';
import { NotFoundError } from '#src/domain/errors/not-found-error.js';

import { UserModel } from './user-model.js';
import { USER_SORT_COLUMN, UserSearchResult } from '#src/modules/user/domain/user-repository.js';

export class UserPersistenceRepository implements UserRepository {
  private readonly encryptionService: IEncryptionService;
  private readonly persistenceService: IPersistenceService;

  public constructor(encryptionService: IEncryptionService, persistenceService: IPersistenceService) {
    this.encryptionService = encryptionService;
    this.persistenceService = persistenceService;
  }

  public async get(id: bigint): Promise<UserEntity> {
    const result: QueryResult<UserRow> = await this.persistenceService
      .getPool()
      .query<UserRow>(`SELECT * FROM users WHERE id = $1`, [id])
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    if (!result.rows[0]) {
      throw new NotFoundError('user not found');
    }

    return UserModel.toEntity(result.rows[0], this.encryptionService);
  }

  public async getByEmail(email: string): Promise<UserEntity> {
    const result: QueryResult<UserRow> = await this.persistenceService
      .getPool()
      .query<UserRow>(`SELECT * FROM users WHERE email = $1`, [email])
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    if (!result.rows[0]) {
      throw new NotFoundError('user not found');
    }

    return UserModel.toEntity(result.rows[0], this.encryptionService);
  }

  public async search(params: UserSearchParams): Promise<UserSearchResult> {
    const rows: QueryResult<UserRow> = await this.persistenceService
      .getPool()
      .query<UserRow>(
        `SELECT *
         FROM users
         WHERE ($1::varchar IS NULL OR name ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')
             AND ($2::user_type_enum IS NULL OR type = $2)
             AND ($3::user_status_enum IS NULL OR status = $3)
         ORDER BY ${USER_SORT_COLUMN[params.sort]} ${params.sortDir}, id
         LIMIT $4 OFFSET $5`,
        [params.filter.search, params.filter.type, params.filter.status, params.perPage, params.offset()],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    const count: QueryResult<{ total: number }> = await this.persistenceService
      .getPool()
      .query<{ total: number }>(
        `SELECT COUNT(*)::int AS total
         FROM users
         WHERE ($1::varchar IS NULL OR name ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')
             AND ($2::user_type_enum IS NULL OR type = $2)
             AND ($3::user_status_enum IS NULL OR status = $3)`,
        [params.filter.search, params.filter.type, params.filter.status],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    return new UserSearchResult(
      rows.rows.map((row: UserRow): UserEntity => UserModel.toEntity(row, this.encryptionService)),
      count.rows[0]?.total ?? 0,
      params,
    );
  }

  public async createTx(tx: PoolClient, user: UserEntity): Promise<void> {
    await tx
      .query(
        `INSERT INTO users (
            id,
            name,
            enc_cpf_cnpj,
            email,
            phone,
            password_hash,
            type,
            status,
            created_at,
            updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [user.id, user.name, this.encryptionService.encrypt(user.cpfCnpj), user.email, user.phone, user.passwordHash, user.type, user.status, user.createdAt, user.updatedAt],
      )
      .catch((error: unknown) => {
        if (error instanceof PgDatabaseError && error.constraint === 'uq_users_email') {
          throw new ConflictError('email already exists');
        }

        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }

  public async updateTx(tx: PoolClient, user: UserEntity): Promise<void> {
    await tx
      .query(
        `UPDATE users
         SET name = $2,
             enc_cpf_cnpj = $3,
             email = $4,
             phone = $5,
             type = $6,
             updated_at = $7
         WHERE id = $1`,
        [user.id, user.name, this.encryptionService.encrypt(user.cpfCnpj), user.email, user.phone, user.type, user.updatedAt],
      )
      .catch((error: unknown) => {
        if (error instanceof PgDatabaseError && error.constraint === 'uq_users_email') {
          throw new ConflictError('email already exists');
        }

        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }

  public async updateStatusTx(tx: PoolClient, user: UserEntity): Promise<void> {
    await tx
      .query(
        `UPDATE users
         SET status = $2,
             updated_at = $3
         WHERE id = $1`,
        [user.id, user.status, user.updatedAt],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }

  public async updatePasswordHashTx(tx: PoolClient, user: UserEntity): Promise<void> {
    await tx
      .query(
        `UPDATE users
         SET password_hash = $2,
             updated_at = $3
         WHERE id = $1`,
        [user.id, user.passwordHash, user.updatedAt],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }
}
