import type { IJwtService } from '#src/infra/jwt/jwt-service.js';
import type { FastifyInstance } from 'fastify';
import type { AuditLogRepository } from '../domain/audit-log-repository.js';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { SubjectTypeEnum } from '#src/domain/enums/subject-type-enum.js';

import { searchInputAuditLogSchema } from '../application/dtos/search-audit-log-dto.js';
import { getAuditLogParamsSchema, getAuditLogQuerySchema } from '../application/dtos/get-audit-log-dto.js';

import { JwtGuard } from '#src/adapters/middlewares/jwt-guard.js';
import { AuditLogController } from './audit-log-controller.js';

import { GetAuditLogUsecase } from '../application/usecases/get-audit-log-usecase.js';
import { SearchAuditLogUsecase } from '../application/usecases/search-audit-log-usecase.js';

export class AuditLogRoutes {
  public static register(app: FastifyInstance, jwtService: IJwtService, auditLogRepository: AuditLogRepository): void {
    const getAuditLogUsecase: GetAuditLogUsecase = new GetAuditLogUsecase(auditLogRepository);
    const searchAuditLogUsecase: SearchAuditLogUsecase = new SearchAuditLogUsecase(auditLogRepository);

    const auditLogController: AuditLogController = new AuditLogController(getAuditLogUsecase, searchAuditLogUsecase);

    app.register(
      async (api: FastifyInstance): Promise<void> => {
        api.addHook('onRequest', new JwtGuard(jwtService, SubjectTypeEnum.USER, [UserTypeEnum.MASTER, UserTypeEnum.MODERATOR]).handle);

        api.get('', { schema: { querystring: searchInputAuditLogSchema } }, auditLogController.search.bind(auditLogController));
        api.get('/:id', { schema: { params: getAuditLogParamsSchema, querystring: getAuditLogQuerySchema } }, auditLogController.get.bind(auditLogController));
      },
      {
        prefix: '/audit-logs',
      },
    );
  }
}
