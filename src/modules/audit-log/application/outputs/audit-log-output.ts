import type { UserOutput } from '#src/modules/user/application/outputs/user-output.js';
import type { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import type { AuditLogEntity } from '../../domain/audit-log-entity.js';

import { UserOutputMapper } from '#src/modules/user/application/outputs/user-output.js';

export type AuditLogOutput = {
  id: string;
  actorId: string | null;
  resourceId: string | null;
  actorType: ActorTypeEnum;
  action: string;
  resource: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  actor?: UserOutput;
};

export class AuditLogOutputMapper {
  public static toOutput(auditLog: AuditLogEntity): AuditLogOutput {
    return {
      id: auditLog.id.toString(),
      actorId: auditLog.actorId?.toString() ?? null,
      resourceId: auditLog.resourceId?.toString() ?? null,
      actorType: auditLog.actorType,
      action: auditLog.action,
      resource: auditLog.resource,
      before: auditLog.before,
      after: auditLog.after,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      metadata: auditLog.metadata,
      createdAt: auditLog.createdAt,
      ...(auditLog.actor ? { actor: UserOutputMapper.toOutput(auditLog.actor) } : {}),
    };
  }
}
