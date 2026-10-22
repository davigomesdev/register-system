import type { PoolClient } from 'pg';
import type { SearchInput } from '#src/domain/repositories/searchable-repository.js';
import type { SessionEntity } from './session-entity.js';

import { SearchParams, SearchResult } from '#src/domain/repositories/searchable-repository.js';

export enum SessionSort {
  CREATED_AT = 'createdAt',
  LAST_USED_AT = 'lastUsedAt',
  EXPIRES_AT = 'expiresAt',
}

export const SESSION_SORT_COLUMN: Record<SessionSort, string> = {
  [SessionSort.CREATED_AT]: 'created_at',
  [SessionSort.LAST_USED_AT]: 'last_used_at',
  [SessionSort.EXPIRES_AT]: 'expires_at',
};

export type SessionFilter = {
  userId?: bigint | undefined;
  familyId?: bigint | undefined;
  activeOnly?: boolean | undefined;
};

export type SessionOption = Record<string, never>;

export type SessionSearchInput = SearchInput<SessionSort, SessionFilter, SessionOption>;

export class SessionSearchParams extends SearchParams<SessionSort, SessionFilter, SessionOption> {
  public constructor(input: SessionSearchInput) {
    super(input, SessionSort.CREATED_AT);
  }
}

export class SessionSearchResult extends SearchResult<SessionEntity> {}

export interface SessionRepository {
  getByIdAndUserId(id: bigint, userId: bigint): Promise<SessionEntity>;
  getByRefreshTokenHash(refreshTokenHash: string): Promise<SessionEntity>;
  search(params: SessionSearchParams): Promise<SessionSearchResult>;
  createTx(tx: PoolClient, session: SessionEntity): Promise<void>;
  updateTx(tx: PoolClient, session: SessionEntity): Promise<void>;
  revokeTx(tx: PoolClient, session: SessionEntity): Promise<void>;
  revokeByFamilyIdTx(tx: PoolClient, familyId: bigint): Promise<void>;
  revokeAllByUserIdTx(tx: PoolClient, userId: bigint): Promise<void>;
}
