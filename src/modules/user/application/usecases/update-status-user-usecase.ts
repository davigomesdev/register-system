import type { Context } from '#src/adapters/contexts/context.js';
import type { PoolClient } from 'pg';
import type { UserOutput } from '../outputs/user-output.js';
import type { UserRepository } from '../../domain/user-repository.js';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';
import type { UpdateStatusUserDto } from '../dtos/update-status-user-dto.js';

import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { UserOutputMapper } from '../outputs/user-output.js';

export class UpdateStatusUserUsecase {
  private readonly persistenceService: IPersistenceService;
  private readonly auditLogProvider: AuditLogProvider;
  private readonly userRepository: UserRepository;

  public constructor(persistenceService: IPersistenceService, auditLogProvider: AuditLogProvider, userRepository: UserRepository) {
    this.persistenceService = persistenceService;
    this.auditLogProvider = auditLogProvider;
    this.userRepository = userRepository;
  }

  public async execute(ctx: Context, input: UpdateStatusUserDto): Promise<UserOutput> {
    const user = await this.userRepository.get(input.id);
    const before = user.toJSON();

    user.updateStatus(input.status);

    await this.persistenceService.begin(async (tx: PoolClient) => {
      await this.userRepository.updateStatusTx(tx, user);

      await this.auditLogProvider.logTx(tx, ctx, {
        resourceId: user.id,
        action: AuditLogActionEnum.UPDATE,
        resource: AuditLogResourceEnum.USER,
        before,
        after: user.toJSON(),
        metadata: {
          field: 'status',
        },
      });
    });

    return UserOutputMapper.toOutput(user);
  }
}
