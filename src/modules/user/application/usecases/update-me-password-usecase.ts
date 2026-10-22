import type { Context } from '#src/adapters/contexts/context.js';
import type { PoolClient } from 'pg';
import type { HashProvider } from '#src/application/providers/hash-provider.js';
import type { UserRepository } from '../../domain/user-repository.js';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';
import type { UpdateMePasswordDto } from '../dtos/update-me-password-dto.js';

import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { ContextFactory } from '#src/adapters/contexts/context.js';
import { UnauthorizedError } from '#src/domain/errors/unauthorized-error.js';

export class UpdateMePasswordUsecase {
  private readonly persistenceService: IPersistenceService;
  private readonly hashProvider: HashProvider;
  private readonly auditLogProvider: AuditLogProvider;
  private readonly userRepository: UserRepository;

  public constructor(persistenceService: IPersistenceService, hashProvider: HashProvider, auditLogProvider: AuditLogProvider, userRepository: UserRepository) {
    this.persistenceService = persistenceService;
    this.hashProvider = hashProvider;
    this.auditLogProvider = auditLogProvider;
    this.userRepository = userRepository;
  }

  public async execute(ctx: Context, input: UpdateMePasswordDto): Promise<void> {
    const actorId = ContextFactory.getActorId(ctx);
    const user = await this.userRepository.get(actorId);

    const passwordValid = await this.hashProvider.verifyPassword(input.oldPassword, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedError();
    }

    const passwordHash = await this.hashProvider.hashPassword(input.newPassword);
    user.updatePasswordHash(passwordHash);

    await this.persistenceService.begin(async (tx: PoolClient) => {
      await this.userRepository.updatePasswordHashTx(tx, user);

      await this.auditLogProvider.logTx(tx, ctx, {
        resourceId: user.id,
        action: AuditLogActionEnum.UPDATE,
        resource: AuditLogResourceEnum.USER,
        metadata: {
          field: 'password',
          scope: 'me',
        },
      });
    });
  }
}
