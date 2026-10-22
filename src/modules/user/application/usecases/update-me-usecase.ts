import type { Context } from '#src/adapters/contexts/context.js';
import type { PoolClient } from 'pg';
import type { UserOutput } from '../outputs/user-output.js';
import type { UpdateMeDto } from '../dtos/update-me-dto.js';
import type { UserRepository } from '../../domain/user-repository.js';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';

import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { ContextFactory } from '#src/adapters/contexts/context.js';
import { UserOutputMapper } from '../outputs/user-output.js';

export class UpdateMeUsecase {
  private readonly persistenceService: IPersistenceService;
  private readonly auditLogProvider: AuditLogProvider;
  private readonly userRepository: UserRepository;

  public constructor(persistenceService: IPersistenceService, auditLogProvider: AuditLogProvider, userRepository: UserRepository) {
    this.persistenceService = persistenceService;
    this.auditLogProvider = auditLogProvider;
    this.userRepository = userRepository;
  }

  public async execute(ctx: Context, input: UpdateMeDto): Promise<UserOutput> {
    const actorId = ContextFactory.getActorId(ctx);
    const user = await this.userRepository.get(actorId);

    const before = user.toJSON();

    user.update({
      name: input.name,
      cpfCnpj: input.cpfCnpj,
      email: input.email,
      phone: input.phone,
      type: user.type,
    });

    await this.persistenceService.begin(async (tx: PoolClient) => {
      await this.userRepository.updateTx(tx, user);

      await this.auditLogProvider.logTx(tx, ctx, {
        resourceId: user.id,
        action: AuditLogActionEnum.UPDATE,
        resource: AuditLogResourceEnum.USER,
        before,
        after: user.toJSON(),
        metadata: {
          scope: 'me',
        },
      });
    });

    return UserOutputMapper.toOutput(user);
  }
}
