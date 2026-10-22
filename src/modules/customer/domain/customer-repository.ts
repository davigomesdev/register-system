import type { PoolClient } from 'pg';
import type { CustomerEntity } from '#src/modules/customer/domain/customer-entity.js';
import type { SearchInput } from '#src/domain/repositories/searchable-repository.js';

import { SearchParams, SearchResult } from '#src/domain/repositories/searchable-repository.js';

export enum CustomerSort {
  NAME = 'name',
  EMAIL = 'email',
  CREATED_AT = 'createdAt',
}

export const CUSTOMER_SORT_COLUMN: Record<CustomerSort, string> = {
  [CustomerSort.NAME]: 'name',
  [CustomerSort.EMAIL]: 'email',
  [CustomerSort.CREATED_AT]: 'created_at',
};

export type CustomerFilter = {
  search: string | null;
};

export type CustomerOption = Record<string, never>;

export type CustomerSearchInput = SearchInput<CustomerSort, CustomerFilter, CustomerOption>;

export class CustomerSearchParams extends SearchParams<CustomerSort, CustomerFilter, CustomerOption> {
  public constructor(input: CustomerSearchInput) {
    super(input, CustomerSort.CREATED_AT);
  }
}

export class CustomerSearchResult extends SearchResult<CustomerEntity> {}

export interface CustomerRepository {
  get(id: bigint): Promise<CustomerEntity>;
  search(params: CustomerSearchParams): Promise<CustomerSearchResult>;
  createTx(tx: PoolClient, customer: CustomerEntity): Promise<void>;
  updateTx(tx: PoolClient, customer: CustomerEntity): Promise<void>;
  softDeleteTx(tx: PoolClient, customer: CustomerEntity): Promise<void>;
}
