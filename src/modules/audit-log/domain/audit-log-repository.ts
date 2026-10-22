import type { PoolClient } from 'pg';
import type { SearchInput } from '#src/domain/repositories/searchable-repository.js';
import type { AuditLogEntity } from './audit-log-entity.js';
import type { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import type { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { SearchParams, SearchResult } from '#src/domain/repositories/searchable-repository.js';

export enum AuditLogSort {
  ACTION = 'action',
  RESOURCE = 'resource',
  CREATED_AT = 'createdAt',
}

export const AUDIT_LOG_SORT_COLUMN: Record<AuditLogSort, string> = {
  [AuditLogSort.ACTION]: 'action',
  [AuditLogSort.RESOURCE]: 'resource',
  [AuditLogSort.CREATED_AT]: 'created_at',
};

export type AuditLogFilter = {
  actorId?: bigint | undefined;
  resourceId?: bigint | undefined;
  action?: AuditLogActionEnum | undefined;
  resource?: AuditLogResourceEnum | undefined;
};

export type AuditLogOption = {
  actor?: boolean | undefined;
};

export type AuditLogSearchInput = SearchInput<AuditLogSort, AuditLogFilter, AuditLogOption>;

export class AuditLogSearchParams extends SearchParams<AuditLogSort, AuditLogFilter, AuditLogOption> {
  public constructor(input: AuditLogSearchInput) {
    super(input, AuditLogSort.CREATED_AT);
  }
}

export class AuditLogSearchResult extends SearchResult<AuditLogEntity> {}

export interface AuditLogRepository {
  get(id: bigint, options?: AuditLogOption): Promise<AuditLogEntity>;
  search(params: AuditLogSearchParams): Promise<AuditLogSearchResult>;
  createTx(tx: PoolClient, auditLog: AuditLogEntity): Promise<void>;
  createBatchTx(tx: PoolClient, auditLogs: AuditLogEntity[]): Promise<void>;
}
