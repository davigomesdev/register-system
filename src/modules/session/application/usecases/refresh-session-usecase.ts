import type { Context } from '#src/adapters/contexts/context.js';
import type { UserEntity } from '#src/modules/user/domain/user-entity.js';
import type { PoolClient } from 'pg';
import type { IJwtService } from '#src/infra/jwt/jwt-service.js';
import type { IEnvService } from '#src/infra/env/env-service.js';
import type { HashProvider } from '#src/application/providers/hash-provider.js';
import type { UserRepository } from '#src/modules/user/domain/user-repository.js';
import type { TokenPairOutput } from '../outputs/token-pair-output.js';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { RefreshSessionDto } from '../dtos/refresh-session-dto.js';
import type { SessionRepository } from '../../domain/session-repository.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';

import { SubjectTypeEnum } from '#src/domain/enums/subject-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { ForbiddenError } from '#src/domain/errors/forbidden-error.js';

import { SessionEntity } from '../../domain/session-entity.js';
import { TokenPairOutputMapper } from '../outputs/token-pair-output.js';

export class RefreshSessionUsecase {
  private readonly envService: IEnvService;
  private readonly jwtService: IJwtService;
  private readonly persistenceService: IPersistenceService;

  private readonly hashProvider: HashProvider;
  private readonly auditLogProvider: AuditLogProvider;

  private readonly userRepository: UserRepository;
  private readonly sessionRepository: SessionRepository;

  public constructor(
    envService: IEnvService,
    jwtService: IJwtService,
    persistenceService: IPersistenceService,
    hashProvider: HashProvider,
    auditLogProvider: AuditLogProvider,
    userRepository: UserRepository,
    sessionRepository: SessionRepository,
  ) {
    this.envService = envService;
    this.jwtService = jwtService;
    this.persistenceService = persistenceService;
    this.hashProvider = hashProvider;
    this.auditLogProvider = auditLogProvider;
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
  }

  public async execute(ctx: Context, input: RefreshSessionDto): Promise<TokenPairOutput> {
    const refreshTokenHash: string = this.hashProvider.hashToken(input.refreshToken, this.envService.getRefreshTokenSecretKey());
    const session: SessionEntity = await this.sessionRepository.getByRefreshTokenHash(refreshTokenHash);

    if (!session.isActive()) {
      await this.persistenceService.begin(async (tx: PoolClient) => {
        await this.sessionRepository.revokeByFamilyIdTx(tx, session.familyId);

        await this.auditLogProvider.logTx(tx, ctx, {
          resourceId: session.id,
          action: AuditLogActionEnum.UPDATE,
          resource: AuditLogResourceEnum.SESSION,
          metadata: {
            reason: 'token_reuse',
            familyId: session.familyId.toString(),
          },
        });
      });

      throw new ForbiddenError();
    }

    const user: UserEntity = await this.userRepository.get(session.userId);

    if (!user.isActive()) {
      throw new ForbiddenError();
    }

    const newRefreshToken: string = this.hashProvider.generateToken();
    const newRefreshTokenHash: string = this.hashProvider.hashToken(newRefreshToken, this.envService.getRefreshTokenSecretKey());

    const before: Record<string, unknown> = session.toJSON();
    const newSession: SessionEntity = SessionEntity.fromParent(session, newRefreshTokenHash);

    session.revoke();

    await this.persistenceService.begin(async (tx: PoolClient) => {
      await this.sessionRepository.updateTx(tx, session);
      await this.sessionRepository.createTx(tx, newSession);

      await this.auditLogProvider.logTx(tx, ctx, [
        {
          resourceId: session.id,
          action: AuditLogActionEnum.UPDATE,
          resource: AuditLogResourceEnum.SESSION,
          before,
          after: session.toJSON(),
          metadata: { reason: 'refresh_revoke' },
        },
        {
          resourceId: newSession.id,
          action: AuditLogActionEnum.CREATE,
          resource: AuditLogResourceEnum.SESSION,
          after: newSession.toJSON(),
          metadata: {
            reason: 'refresh_rotate',
            parentId: session.id.toString(),
            familyId: session.familyId.toString(),
          },
        },
      ]);
    });

    const now: number = Math.floor(Date.now() / 1000);
    const accessToken: string = await this.jwtService.createToken(newSession.userId, SubjectTypeEnum.USER, user.type, now);

    return TokenPairOutputMapper.toOutput(accessToken, newRefreshToken);
  }
}
