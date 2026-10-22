import type { PoolClient } from 'pg';
import type { ProductEntity } from '#src/modules/product/domain/product-entity.js';
import type { SearchInput } from '#src/domain/repositories/searchable-repository.js';
import type { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';

import { SearchParams, SearchResult } from '#src/domain/repositories/searchable-repository.js';

export enum ProductSort {
  NAME = 'name',
  SKU = 'sku',
  COST_PRICE = 'costPrice',
  CREATED_AT = 'createdAt',
}

export const PRODUCT_SORT_COLUMN: Record<ProductSort, string> = {
  [ProductSort.NAME]: 'name',
  [ProductSort.SKU]: 'sku',
  [ProductSort.COST_PRICE]: 'cost_price',
  [ProductSort.CREATED_AT]: 'created_at',
};

export type ProductFilter = {
  search: string | null;
  gender: ProductGenderEnum | null;
};

export type ProductOption = Record<string, never>;

export type ProductSearchInput = SearchInput<ProductSort, ProductFilter, ProductOption>;

export class ProductSearchParams extends SearchParams<ProductSort, ProductFilter, ProductOption> {
  public constructor(input: ProductSearchInput) {
    super(input, ProductSort.CREATED_AT);
  }
}

export class ProductSearchResult extends SearchResult<ProductEntity> {}

export interface ProductRepository {
  get(id: bigint): Promise<ProductEntity>;
  search(params: ProductSearchParams): Promise<ProductSearchResult>;
  createTx(tx: PoolClient, product: ProductEntity): Promise<void>;
  updateTx(tx: PoolClient, product: ProductEntity): Promise<void>;
  softDeleteTx(tx: PoolClient, product: ProductEntity): Promise<void>;
}
