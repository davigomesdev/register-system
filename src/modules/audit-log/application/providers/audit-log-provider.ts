import type { Context } from '#src/adapters/contexts/context.js';
import type { PoolClient } from 'pg';
import type { AuditLogRepository } from '../../domain/audit-log-repository.js';
import type { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import type { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { AuditLogEntity } from '../../domain/audit-log-entity.js';

type AuditLogInput = {
  resourceId?: bigint | null;
  action: AuditLogActionEnum;
  resource: AuditLogResourceEnum;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
};

export class AuditLogProvider {
  private readonly auditLogRepository: AuditLogRepository;

  public constructor(auditLogRepository: AuditLogRepository) {
    this.auditLogRepository = auditLogRepository;
  }

  public async logTx(tx: PoolClient, ctx: Context, input: AuditLogInput | AuditLogInput[]): Promise<void> {
    const inputs: AuditLogInput[] = Array.isArray(input) ? input : [input];

    const auditLogs: AuditLogEntity[] = inputs.map(
      (item: AuditLogInput) =>
        new AuditLogEntity({
          ...item,
          actorId: ctx.actorId,
          actorType: ctx.actorType,
          ipAddress: ctx.ip,
          userAgent: ctx.userAgent,
        }),
    );

    if (auditLogs.length === 1 && auditLogs[0]) {
      await this.auditLogRepository.createTx(tx, auditLogs[0]);
    } else {
      await this.auditLogRepository.createBatchTx(tx, auditLogs);
    }
  }
}
