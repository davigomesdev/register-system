import type { CustomerRow } from './customer-model.js';
import type { CustomerEntity } from '#src/modules/customer/domain/customer-entity.js';
import type { IEncryptionService } from '#src/infra/encryption/encryption-service.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';
import type { PoolClient, QueryResult } from 'pg';
import type { CustomerRepository, CustomerSearchParams } from '#src/modules/customer/domain/customer-repository.js';

import { DatabaseError } from '#src/domain/errors/database-error.js';
import { NotFoundError } from '#src/domain/errors/not-found-error.js';

import { CustomerModel } from './customer-model.js';
import { CUSTOMER_SORT_COLUMN, CustomerSearchResult } from '#src/modules/customer/domain/customer-repository.js';

export class CustomerPersistenceRepository implements CustomerRepository {
  private readonly encryptionService: IEncryptionService;
  private readonly persistenceService: IPersistenceService;

  public constructor(encryptionService: IEncryptionService, persistenceService: IPersistenceService) {
    this.encryptionService = encryptionService;
    this.persistenceService = persistenceService;
  }

  public async get(id: bigint): Promise<CustomerEntity> {
    const result: QueryResult<CustomerRow> = await this.persistenceService
      .getPool()
      .query<CustomerRow>(`SELECT * FROM customers WHERE id = $1 AND deleted_at IS NULL`, [id])
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    if (!result.rows[0]) {
      throw new NotFoundError('customer not found');
    }

    return CustomerModel.toEntity(result.rows[0], this.encryptionService);
  }

  public async search(params: CustomerSearchParams): Promise<CustomerSearchResult> {
    const rows: QueryResult<CustomerRow> = await this.persistenceService
      .getPool()
      .query<CustomerRow>(
        `SELECT *
         FROM customers
         WHERE deleted_at IS NULL
             AND ($1::varchar IS NULL OR name ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')
         ORDER BY ${CUSTOMER_SORT_COLUMN[params.sort]} ${params.sortDir}, id
         LIMIT $2 OFFSET $3`,
        [params.filter.search, params.perPage, params.offset()],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    const count: QueryResult<{ total: number }> = await this.persistenceService
      .getPool()
      .query<{ total: number }>(
        `SELECT COUNT(*)::int AS total
         FROM customers
         WHERE deleted_at IS NULL
             AND ($1::varchar IS NULL OR name ILIKE '%' || $1 || '%' OR email ILIKE '%' || $1 || '%')`,
        [params.filter.search],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    return new CustomerSearchResult(
      rows.rows.map((row: CustomerRow): CustomerEntity => CustomerModel.toEntity(row, this.encryptionService)),
      count.rows[0]?.total ?? 0,
      params,
    );
  }

  public async createTx(tx: PoolClient, customer: CustomerEntity): Promise<void> {
    await tx
      .query(
        `INSERT INTO customers (
            id,
            name,
            enc_cpf_cnpj,
            email,
            phone,
            created_at,
            updated_at,
            deleted_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          customer.id,
          customer.name,
          customer.cpfCnpj ? this.encryptionService.encrypt(customer.cpfCnpj) : null,
          customer.email,
          customer.phone,
          customer.createdAt,
          customer.updatedAt,
          customer.deletedAt,
        ],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }

  public async updateTx(tx: PoolClient, customer: CustomerEntity): Promise<void> {
    await tx
      .query(
        `UPDATE customers
         SET name = $2,
             enc_cpf_cnpj = $3,
             email = $4,
             phone = $5,
             updated_at = $6
         WHERE id = $1 AND deleted_at IS NULL`,
        [customer.id, customer.name, customer.cpfCnpj ? this.encryptionService.encrypt(customer.cpfCnpj) : null, customer.email, customer.phone, customer.updatedAt],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }

  public async softDeleteTx(tx: PoolClient, customer: CustomerEntity): Promise<void> {
    await tx
      .query(
        `UPDATE customers
         SET deleted_at = $2
         WHERE id = $1 AND deleted_at IS NULL`,
        [customer.id, customer.deletedAt],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }
}
