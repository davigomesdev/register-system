import type { Context } from '#src/adapters/contexts/context.js';
import type { PoolClient } from 'pg';
import type { UserEntity } from '#src/modules/user/domain/user-entity.js';
import type { IJwtService } from '#src/infra/jwt/jwt-service.js';
import type { IEnvService } from '#src/infra/env/env-service.js';
import type { HashProvider } from '#src/application/providers/hash-provider.js';
import type { UserRepository } from '#src/modules/user/domain/user-repository.js';
import type { TokenPairOutput } from '../outputs/token-pair-output.js';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { CreateSessionDto } from '../dtos/create-session-dto.js';
import type { SessionRepository } from '../../domain/session-repository.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';

import { SubjectTypeEnum } from '#src/domain/enums/subject-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { NotFoundError } from '#src/domain/errors/not-found-error.js';
import { UnauthorizedError } from '#src/domain/errors/unauthorized-error.js';

import { SessionEntity } from '../../domain/session-entity.js';
import { TokenPairOutputMapper } from '../outputs/token-pair-output.js';

export class CreateSessionUsecase {
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

  public async execute(ctx: Context, input: CreateSessionDto): Promise<TokenPairOutput> {
    const user: UserEntity = await this.userRepository.getByEmail(input.email).catch((error) => {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError();
      }

      throw error;
    });

    if (!user.isActive()) {
      throw new UnauthorizedError();
    }

    const passwordValid: boolean = await this.hashProvider.verifyPassword(input.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedError();
    }

    const refreshToken: string = this.hashProvider.generateToken();
    const refreshTokenHash: string = this.hashProvider.hashToken(refreshToken, this.envService.getRefreshTokenSecretKey());

    const session: SessionEntity = new SessionEntity({
      userId: user.id,
      refreshTokenHash,
      ipAddress: ctx.ip,
      userAgent: ctx.userAgent,
      deviceInfo: ctx.deviceInfo,
    });

    await this.persistenceService.begin(async (tx: PoolClient) => {
      await this.sessionRepository.createTx(tx, session);

      await this.auditLogProvider.logTx(tx, ctx, {
        resourceId: session.id,
        action: AuditLogActionEnum.CREATE,
        resource: AuditLogResourceEnum.SESSION,
        after: session.toJSON(),
      });
    });

    const now: number = Math.floor(Date.now() / 1000);
    const accessToken: string = await this.jwtService.createToken(session.userId, SubjectTypeEnum.USER, user.type, now);

    return TokenPairOutputMapper.toOutput(accessToken, refreshToken);
  }
}
