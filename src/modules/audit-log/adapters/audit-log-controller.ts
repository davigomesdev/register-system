import type { AuditLogOutput } from '../application/outputs/audit-log-output.js';
import type { GetAuditLogDto } from '../application/dtos/get-audit-log-dto.js';
import type { GetAuditLogUsecase } from '../application/usecases/get-audit-log-usecase.js';
import type { AuditLogSearchResult } from '../domain/audit-log-repository.js';
import type { SearchAuditLogUsecase } from '../application/usecases/search-audit-log-usecase.js';
import type { SearchInputAuditLogDto } from '../application/dtos/search-audit-log-dto.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { AuditLogOutputMapper } from '../application/outputs/audit-log-output.js';
import { CollectionPresenter, Presenter } from '#src/adapters/presenters/presenter.js';

export class AuditLogController {
  private readonly getAuditLogUsecase: GetAuditLogUsecase;
  private readonly searchAuditLogUsecase: SearchAuditLogUsecase;

  public constructor(getAuditLogUsecase: GetAuditLogUsecase, searchAuditLogUsecase: SearchAuditLogUsecase) {
    this.getAuditLogUsecase = getAuditLogUsecase;
    this.searchAuditLogUsecase = searchAuditLogUsecase;
  }

  public async get(req: FastifyRequest<{ Params: Pick<GetAuditLogDto, 'id'>; Querystring: Omit<GetAuditLogDto, 'id'> }>, reply: FastifyReply): Promise<void> {
    const auditLog: AuditLogOutput = await this.getAuditLogUsecase.execute({ ...req.query, ...req.params });
    return reply.status(200).send(Presenter.wrapper(auditLog));
  }

  public async search(req: FastifyRequest<{ Querystring: SearchInputAuditLogDto }>, reply: FastifyReply): Promise<void> {
    const result: AuditLogSearchResult = await this.searchAuditLogUsecase.execute(req.query);

    return reply.status(200).send(
      CollectionPresenter.wrapper(result.items.map(AuditLogOutputMapper.toOutput), {
        currentPage: result.page,
        perPage: result.perPage,
        lastPage: result.lastPage(),
        total: result.total,
      }),
    );
  }
}
