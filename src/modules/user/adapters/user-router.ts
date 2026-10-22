import type { IJwtService } from '#src/infra/jwt/jwt-service.js';
import type { HashProvider } from '#src/application/providers/hash-provider.js';
import type { UserRepository } from '../domain/user-repository.js';
import type { FastifyInstance } from 'fastify';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { SubjectTypeEnum } from '#src/domain/enums/subject-type-enum.js';

import { updateMeSchema } from '../application/dtos/update-me-dto.js';
import { createUserSchema } from '../application/dtos/create-user-dto.js';
import { searchUserSchema } from '../application/dtos/search-user-dto.js';
import { getUserParamsSchema } from '../application/dtos/get-user-dto.js';
import { updateMePasswordSchema } from '../application/dtos/update-me-password-dto.js';
import { updateUserParamsSchema, updateUserBodySchema } from '../application/dtos/update-user-dto.js';
import { updateStatusUserParamsSchema, updateStatusUserBodySchema } from '../application/dtos/update-status-user-dto.js';

import { JwtGuard } from '#src/adapters/middlewares/jwt-guard.js';
import { UserController } from './user-controller.js';

import { GetUserUsecase } from '../application/usecases/get-user-usecase.js';
import { UpdateMeUsecase } from '../application/usecases/update-me-usecase.js';
import { GetMeUserUsecase } from '../application/usecases/get-me-user-usecase.js';
import { SearchUserUsecase } from '../application/usecases/search-user-usecase.js';
import { UpdateUserUsecase } from '../application/usecases/update-user-usecase.js';
import { CreateUserUsecase } from '../application/usecases/create-user-usecase.js';
import { UpdateMePasswordUsecase } from '../application/usecases/update-me-password-usecase.js';
import { UpdateStatusUserUsecase } from '../application/usecases/update-status-user-usecase.js';

export class UserRoutes {
  public static register(
    app: FastifyInstance,
    jwtService: IJwtService,
    persistenceService: IPersistenceService,
    hashProvider: HashProvider,
    auditLogProvider: AuditLogProvider,
    userRepository: UserRepository,
  ): void {
    const createUserUsecase = new CreateUserUsecase(persistenceService, hashProvider, auditLogProvider, userRepository);
    const getUserUsecase = new GetUserUsecase(userRepository);
    const getMeUserUsecase = new GetMeUserUsecase(userRepository);
    const searchUserUsecase = new SearchUserUsecase(userRepository);
    const updateUserUsecase = new UpdateUserUsecase(persistenceService, auditLogProvider, userRepository);
    const updateMeUsecase = new UpdateMeUsecase(persistenceService, auditLogProvider, userRepository);
    const updateMePasswordUsecase = new UpdateMePasswordUsecase(persistenceService, hashProvider, auditLogProvider, userRepository);
    const updateStatusUserUsecase = new UpdateStatusUserUsecase(persistenceService, auditLogProvider, userRepository);

    const userController = new UserController(
      createUserUsecase,
      getUserUsecase,
      getMeUserUsecase,
      searchUserUsecase,
      updateUserUsecase,
      updateMeUsecase,
      updateMePasswordUsecase,
      updateStatusUserUsecase,
    );

    app.register(
      async (api: FastifyInstance): Promise<void> => {
        api.register(
          async (me: FastifyInstance): Promise<void> => {
            me.addHook('onRequest', new JwtGuard(jwtService, SubjectTypeEnum.USER).handle);

            me.get('', userController.getMe.bind(userController));
            me.put('', { schema: { body: updateMeSchema } }, userController.updateMe.bind(userController));
            me.put('/password', { schema: { body: updateMePasswordSchema } }, userController.updateMePassword.bind(userController));
          },
          { prefix: '/me' },
        );

        api.register(
          async (admin: FastifyInstance): Promise<void> => {
            admin.addHook('onRequest', new JwtGuard(jwtService, SubjectTypeEnum.USER).handle);

            admin.get('', { schema: { querystring: searchUserSchema } }, userController.search.bind(userController));
            admin.get('/:id', { schema: { params: getUserParamsSchema } }, userController.get.bind(userController));
            admin.put('/:id', { schema: { params: updateUserParamsSchema, body: updateUserBodySchema } }, userController.update.bind(userController));
            admin.patch('/:id/status', { schema: { params: updateStatusUserParamsSchema, body: updateStatusUserBodySchema } }, userController.updateStatus.bind(userController));
          },
          { prefix: '' },
        );

        api.register(
          async (master: FastifyInstance): Promise<void> => {
            master.addHook('onRequest', new JwtGuard(jwtService, SubjectTypeEnum.USER, [UserTypeEnum.MASTER]).handle);
            master.post('', { schema: { body: createUserSchema } }, userController.create.bind(userController));
          },
          { prefix: '' },
        );
      },
      { prefix: '/users' },
    );
  }
}
