import type { IEnvService } from '#src/infra/env/env-service.js';
import type { IJwtService } from '#src/infra/jwt/jwt-service.js';
import type { HashProvider } from '#src/application/providers/hash-provider.js';
import type { UserRepository } from '#src/modules/user/domain/user-repository.js';
import type { FastifyInstance } from 'fastify';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { SessionRepository } from '../domain/session-repository.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';

import { SubjectTypeEnum } from '#src/domain/enums/subject-type-enum.js';

import { createSessionSchema } from '../application/dtos/create-session-dto.js';
import { searchMeSessionSchema } from '../application/dtos/search-me-session-dto.js';
import { getMeSessionParamsSchema } from '../application/dtos/get-me-session-dto.js';
import { revokeMeSessionParamsSchema } from '../application/dtos/revoke-me-session-dto.js';

import { JwtGuard } from '#src/adapters/middlewares/jwt-guard.js';
import { SessionController } from './session-controller.js';

import { GetMeSessionUsecase } from '../application/usecases/get-me-session-usecase.js';
import { CreateSessionUsecase } from '../application/usecases/create-session-usecase.js';
import { RefreshSessionUsecase } from '../application/usecases/refresh-session-usecase.js';
import { SearchMeSessionUsecase } from '../application/usecases/search-me-session-usecase.js';
import { RevokeMeSessionUsecase } from '../application/usecases/revoke-me-session-usecase.js';
import { RevokeMeAllSessionUsecase } from '../application/usecases/revoke-me-all-session-usecase.js';

export class SessionRoutes {
  public static register(
    app: FastifyInstance,
    envService: IEnvService,
    jwtService: IJwtService,
    persistenceService: IPersistenceService,
    hashProvider: HashProvider,
    auditLogProvider: AuditLogProvider,
    userRepository: UserRepository,
    sessionRepository: SessionRepository,
  ): void {
    const createSessionUsecase: CreateSessionUsecase = new CreateSessionUsecase(
      envService,
      jwtService,
      persistenceService,
      hashProvider,
      auditLogProvider,
      userRepository,
      sessionRepository,
    );

    const refreshSessionUsecase: RefreshSessionUsecase = new RefreshSessionUsecase(
      envService,
      jwtService,
      persistenceService,
      hashProvider,
      auditLogProvider,
      userRepository,
      sessionRepository,
    );

    const getMeSessionUsecase: GetMeSessionUsecase = new GetMeSessionUsecase(sessionRepository);
    const searchMeSessionUsecase: SearchMeSessionUsecase = new SearchMeSessionUsecase(sessionRepository);
    const revokeMeSessionUsecase: RevokeMeSessionUsecase = new RevokeMeSessionUsecase(persistenceService, auditLogProvider, sessionRepository);
    const revokeMeAllSessionUsecase: RevokeMeAllSessionUsecase = new RevokeMeAllSessionUsecase(persistenceService, auditLogProvider, sessionRepository);

    const sessionController: SessionController = new SessionController(
      envService,
      createSessionUsecase,
      refreshSessionUsecase,
      getMeSessionUsecase,
      searchMeSessionUsecase,
      revokeMeSessionUsecase,
      revokeMeAllSessionUsecase,
    );

    app.register(
      async (api: FastifyInstance): Promise<void> => {
        api.post(
          '',
          {
            schema: { body: createSessionSchema },
            config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
          },
          sessionController.create.bind(sessionController),
        );

        api.post(
          '/refresh',
          {
            config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
          },
          sessionController.refresh.bind(sessionController),
        );

        api.register(
          async (me: FastifyInstance): Promise<void> => {
            me.addHook('onRequest', new JwtGuard(jwtService, SubjectTypeEnum.USER).handle);

            me.get('', { schema: { querystring: searchMeSessionSchema } }, sessionController.searchMe.bind(sessionController));
            me.get('/:id', { schema: { params: getMeSessionParamsSchema } }, sessionController.getMe.bind(sessionController));
            me.delete('', sessionController.revokeMeAll.bind(sessionController));
            me.delete('/:id', { schema: { params: revokeMeSessionParamsSchema } }, sessionController.revokeMe.bind(sessionController));
          },
          { prefix: '/me' },
        );
      },
      { prefix: '/sessions' },
    );
  }
}
