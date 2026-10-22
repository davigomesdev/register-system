import type { Context } from '#src/adapters/contexts/context.js';
import type { PoolClient } from 'pg';
import type { UserOutput } from '../outputs/user-output.js';
import type { HashProvider } from '#src/application/providers/hash-provider.js';
import type { CreateUserDto } from '../dtos/create-user-dto.js';
import type { UserRepository } from '../../domain/user-repository.js';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';

import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { UserEntity } from '../../domain/user-entity.js';
import { UserOutputMapper } from '../outputs/user-output.js';

export class CreateUserUsecase {
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

  public async execute(ctx: Context, input: CreateUserDto): Promise<UserOutput> {
    const passwordHash: string = await this.hashProvider.hashPassword(input.password);

    const user: UserEntity = new UserEntity({
      ...input,
      passwordHash,
    });

    await this.persistenceService.begin(async (tx: PoolClient) => {
      await this.userRepository.createTx(tx, user);

      await this.auditLogProvider.logTx(tx, ctx, {
        resourceId: user.id,
        action: AuditLogActionEnum.CREATE,
        resource: AuditLogResourceEnum.USER,
        after: user.toJSON(),
      });
    });

    return UserOutputMapper.toOutput(user);
  }
}
