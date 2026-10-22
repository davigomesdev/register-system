import type { Context } from '#src/adapters/contexts/context.js';
import type { PoolClient } from 'pg';
import type { SessionEntity } from '../../domain/session-entity.js';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { SessionRepository } from '../../domain/session-repository.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';
import type { RevokeMeSessionParamsDto } from '../dtos/revoke-me-session-dto.js';

import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { NotFoundError } from '#src/domain/errors/not-found-error.js';
import { ForbiddenError } from '#src/domain/errors/forbidden-error.js';
import { UnauthorizedError } from '#src/domain/errors/unauthorized-error.js';

import { ContextFactory } from '#src/adapters/contexts/context.js';

export class RevokeMeSessionUsecase {
  private readonly persistenceService: IPersistenceService;
  private readonly auditLogProvider: AuditLogProvider;
  private readonly sessionRepository: SessionRepository;

  public constructor(persistenceService: IPersistenceService, auditLogProvider: AuditLogProvider, sessionRepository: SessionRepository) {
    this.persistenceService = persistenceService;
    this.auditLogProvider = auditLogProvider;
    this.sessionRepository = sessionRepository;
  }

  public async execute(ctx: Context, input: RevokeMeSessionParamsDto): Promise<void> {
    const actorId: bigint = ContextFactory.getActorId(ctx);

    const session: SessionEntity = await this.sessionRepository.getByIdAndUserId(input.id, actorId).catch((error) => {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError();
      }

      throw error;
    });

    if (!session.isActive()) {
      throw new ForbiddenError();
    }

    session.revoke();

    await this.persistenceService.begin(async (tx: PoolClient) => {
      await this.sessionRepository.revokeTx(tx, session);

      await this.auditLogProvider.logTx(tx, ctx, {
        resourceId: session.id,
        action: AuditLogActionEnum.UPDATE,
        resource: AuditLogResourceEnum.SESSION,
        after: session.toJSON(),
        metadata: {
          reason: 'revoke',
        },
      });
    });
  }
}
