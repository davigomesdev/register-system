import type { ProductRow } from './product-model.js';
import type { ProductEntity } from '#src/modules/product/domain/product-entity.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';
import type { PoolClient, QueryResult } from 'pg';
import type { ProductRepository, ProductSearchParams } from '#src/modules/product/domain/product-repository.js';

import { DatabaseError as PgDatabaseError } from 'pg';

import { ConflictError } from '#src/domain/errors/conflict-error.js';
import { DatabaseError } from '#src/domain/errors/database-error.js';
import { NotFoundError } from '#src/domain/errors/not-found-error.js';

import { ProductModel } from './product-model.js';
import { PRODUCT_SORT_COLUMN, ProductSearchResult } from '#src/modules/product/domain/product-repository.js';

export class ProductPersistenceRepository implements ProductRepository {
  private readonly persistenceService: IPersistenceService;

  public constructor(persistenceService: IPersistenceService) {
    this.persistenceService = persistenceService;
  }

  public async get(id: bigint): Promise<ProductEntity> {
    const result: QueryResult<ProductRow> = await this.persistenceService
      .getPool()
      .query<ProductRow>(`SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL`, [id])
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    if (!result.rows[0]) {
      throw new NotFoundError('product not found');
    }

    return ProductModel.toEntity(result.rows[0]);
  }

  public async search(params: ProductSearchParams): Promise<ProductSearchResult> {
    const rows: QueryResult<ProductRow> = await this.persistenceService
      .getPool()
      .query<ProductRow>(
        `SELECT *
         FROM products
         WHERE deleted_at IS NULL
             AND ($1::varchar IS NULL OR name ILIKE '%' || $1 || '%' OR sku ILIKE '%' || $1 || '%' OR slug ILIKE '%' || $1 || '%')
             AND ($2::product_gender_enum IS NULL OR gender = $2)
         ORDER BY ${PRODUCT_SORT_COLUMN[params.sort]} ${params.sortDir}, id
         LIMIT $3 OFFSET $4`,
        [params.filter.search, params.filter.gender, params.perPage, params.offset()],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    const count: QueryResult<{ total: number }> = await this.persistenceService
      .getPool()
      .query<{ total: number }>(
        `SELECT COUNT(*)::int AS total
         FROM products
         WHERE deleted_at IS NULL
             AND ($1::varchar IS NULL OR name ILIKE '%' || $1 || '%' OR sku ILIKE '%' || $1 || '%' OR slug ILIKE '%' || $1 || '%')
             AND ($2::product_gender_enum IS NULL OR gender = $2)`,
        [params.filter.search, params.filter.gender],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });

    return new ProductSearchResult(
      rows.rows.map((row: ProductRow): ProductEntity => ProductModel.toEntity(row)),
      count.rows[0]?.total ?? 0,
      params,
    );
  }

  public async createTx(tx: PoolClient, product: ProductEntity): Promise<void> {
    await tx
      .query(
        `INSERT INTO products (
            id,
            sku,
            name,
            slug,
            description,
            cost_price,
            gender,
            created_at,
            updated_at,
            deleted_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          product.id,
          product.sku,
          product.name,
          product.slug,
          product.description,
          product.costPrice.toFixed(4),
          product.gender,
          product.createdAt,
          product.updatedAt,
          product.deletedAt,
        ],
      )
      .catch((error: unknown) => {
        if (error instanceof PgDatabaseError && error.constraint === 'uq_products_sku') {
          throw new ConflictError('sku already exists');
        }

        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }

  public async updateTx(tx: PoolClient, product: ProductEntity): Promise<void> {
    await tx
      .query(
        `UPDATE products
         SET sku = $2,
             name = $3,
             slug = $4,
             description = $5,
             cost_price = $6,
             gender = $7,
             updated_at = $8
         WHERE id = $1 AND deleted_at IS NULL`,
        [product.id, product.sku, product.name, product.slug, product.description, product.costPrice.toFixed(4), product.gender, product.updatedAt],
      )
      .catch((error: unknown) => {
        if (error instanceof PgDatabaseError && error.constraint === 'uq_products_sku') {
          throw new ConflictError('sku already exists');
        }

        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }

  public async softDeleteTx(tx: PoolClient, product: ProductEntity): Promise<void> {
    await tx
      .query(
        `UPDATE products
         SET deleted_at = $2
         WHERE id = $1 AND deleted_at IS NULL`,
        [product.id, product.deletedAt, product.updatedAt],
      )
      .catch((error: unknown) => {
        throw new DatabaseError(error instanceof Error ? error.message : 'unknown database error');
      });
  }
}
