import type { PoolClient } from 'pg';
import type { UserEntity } from '#src/modules/user/domain/user-entity.js';
import type { SearchInput } from '#src/domain/repositories/searchable-repository.js';
import type { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import type { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';

import { SearchParams, SearchResult } from '#src/domain/repositories/searchable-repository.js';

export enum UserSort {
  NAME = 'name',
  EMAIL = 'email',
  CREATED_AT = 'createdAt',
}

export const USER_SORT_COLUMN: Record<UserSort, string> = {
  [UserSort.NAME]: 'name',
  [UserSort.EMAIL]: 'email',
  [UserSort.CREATED_AT]: 'created_at',
};

export type UserFilter = {
  search: string | null;
  type: UserTypeEnum | null;
  status: UserStatusEnum | null;
};

export type UserOption = Record<string, never>;

export type UserSearchInput = SearchInput<UserSort, UserFilter, UserOption>;

export class UserSearchParams extends SearchParams<UserSort, UserFilter, UserOption> {
  public constructor(input: UserSearchInput) {
    super(input, UserSort.CREATED_AT);
  }
}

export class UserSearchResult extends SearchResult<UserEntity> {}

export interface UserRepository {
  get(id: bigint): Promise<UserEntity>;
  getByEmail(email: string): Promise<UserEntity>;
  search(params: UserSearchParams): Promise<UserSearchResult>;
  createTx(tx: PoolClient, user: UserEntity): Promise<void>;
  updateTx(tx: PoolClient, user: UserEntity): Promise<void>;
  updateStatusTx(tx: PoolClient, user: UserEntity): Promise<void>;
  updatePasswordHashTx(tx: PoolClient, user: UserEntity): Promise<void>;
}
