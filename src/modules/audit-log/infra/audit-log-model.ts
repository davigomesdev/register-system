import type { UserRow } from '#src/modules/user/infra/user-model.js';
import type { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import type { IEncryptionService } from '#src/infra/encryption/encryption-service.js';
import type { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import type { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { UserModel } from '#src/modules/user/infra/user-model.js';
import { AuditLogEntity } from '../domain/audit-log-entity.js';

export type AuditLogRow = {
  id: string;
  actor_id: string | null;
  resource_id: string | null;
  actor_type: ActorTypeEnum;
  action: AuditLogActionEnum;
  resource: AuditLogResourceEnum;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  actor?: UserRow | null;
};

export class AuditLogModel {
  public static toEntity(row: AuditLogRow, encryptionService: IEncryptionService): AuditLogEntity {
    return new AuditLogEntity(
      {
        actorId: row.actor_id === null ? null : BigInt(row.actor_id),
        resourceId: row.resource_id === null ? null : BigInt(row.resource_id),
        actorType: row.actor_type,
        action: row.action,
        resource: row.resource,
        before: row.before,
        after: row.after,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        metadata: row.metadata,
        createdAt: row.created_at,
        actor: row.actor ? UserModel.toEntity(row.actor, encryptionService) : null,
      },
      BigInt(row.id),
    );
  }
}
