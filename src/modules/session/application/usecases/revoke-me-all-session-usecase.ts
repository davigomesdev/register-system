import type { Context } from '#src/adapters/contexts/context.js';
import type { PoolClient } from 'pg';
import type { SessionRepository } from '../../domain/session-repository.js';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';

import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { ContextFactory } from '#src/adapters/contexts/context.js';

export class RevokeMeAllSessionUsecase {
  private readonly persistenceService: IPersistenceService;
  private readonly auditLogProvider: AuditLogProvider;
  private readonly sessionRepository: SessionRepository;

  public constructor(persistenceService: IPersistenceService, auditLogProvider: AuditLogProvider, sessionRepository: SessionRepository) {
    this.persistenceService = persistenceService;
    this.auditLogProvider = auditLogProvider;
    this.sessionRepository = sessionRepository;
  }

  public async execute(ctx: Context): Promise<void> {
    const actorId: bigint = ContextFactory.getActorId(ctx);

    await this.persistenceService.begin(async (tx: PoolClient) => {
      await this.sessionRepository.revokeAllByUserIdTx(tx, actorId);

      await this.auditLogProvider.logTx(tx, ctx, {
        resourceId: actorId,
        action: AuditLogActionEnum.UPDATE,
        resource: AuditLogResourceEnum.SESSION,
        metadata: {
          reason: 'revoke_all',
          userId: actorId.toString(),
        },
      });
    });
  }
}
