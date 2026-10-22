import type { IEnvService } from '#src/infra/env/env-service.js';
import type { SessionOutput } from '../application/outputs/session-output.js';
import type { TokenPairOutput } from '../application/outputs/token-pair-output.js';
import type { CreateSessionDto } from '../application/dtos/create-session-dto.js';
import type { SearchMeSessionDto } from '../application/dtos/search-me-session-dto.js';
import type { GetMeSessionUsecase } from '../application/usecases/get-me-session-usecase.js';
import type { SessionSearchResult } from '../domain/session-repository.js';
import type { CreateSessionUsecase } from '../application/usecases/create-session-usecase.js';
import type { GetMeSessionParamsDto } from '../application/dtos/get-me-session-dto.js';
import type { RefreshSessionUsecase } from '../application/usecases/refresh-session-usecase.js';
import type { SearchMeSessionUsecase } from '../application/usecases/search-me-session-usecase.js';
import type { RevokeMeSessionUsecase } from '../application/usecases/revoke-me-session-usecase.js';
import type { RevokeMeSessionParamsDto } from '../application/dtos/revoke-me-session-dto.js';
import type { RevokeMeAllSessionUsecase } from '../application/usecases/revoke-me-all-session-usecase.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { REFRESH_TOKEN_EXPIRY_DAYS } from '../domain/session-entity.js';

import { UnauthorizedError } from '#src/domain/errors/unauthorized-error.js';

import { ContextFactory } from '#src/adapters/contexts/context.js';
import { SessionOutputMapper } from '../application/outputs/session-output.js';
import { CollectionPresenter, Presenter } from '#src/adapters/presenters/presenter.js';

const REFRESH_TOKEN_COOKIE_NAME: string = 'refresh_token';
const REFRESH_TOKEN_COOKIE_PATH: string = '/api/v1/sessions';

export class SessionController {
  private readonly envService: IEnvService;

  private readonly createSessionUsecase: CreateSessionUsecase;
  private readonly refreshSessionUsecase: RefreshSessionUsecase;
  private readonly getMeSessionUsecase: GetMeSessionUsecase;
  private readonly searchMeSessionUsecase: SearchMeSessionUsecase;
  private readonly revokeMeSessionUsecase: RevokeMeSessionUsecase;
  private readonly revokeMeAllSessionUsecase: RevokeMeAllSessionUsecase;

  public constructor(
    envService: IEnvService,
    createSessionUsecase: CreateSessionUsecase,
    refreshSessionUsecase: RefreshSessionUsecase,
    getMeSessionUsecase: GetMeSessionUsecase,
    searchMeSessionUsecase: SearchMeSessionUsecase,
    revokeMeSessionUsecase: RevokeMeSessionUsecase,
    revokeMeAllSessionUsecase: RevokeMeAllSessionUsecase,
  ) {
    this.envService = envService;
    this.createSessionUsecase = createSessionUsecase;
    this.refreshSessionUsecase = refreshSessionUsecase;
    this.getMeSessionUsecase = getMeSessionUsecase;
    this.searchMeSessionUsecase = searchMeSessionUsecase;
    this.revokeMeSessionUsecase = revokeMeSessionUsecase;
    this.revokeMeAllSessionUsecase = revokeMeAllSessionUsecase;
  }

  public async getMe(req: FastifyRequest<{ Params: GetMeSessionParamsDto }>, reply: FastifyReply): Promise<void> {
    const session: SessionOutput = await this.getMeSessionUsecase.execute(ContextFactory.fromRequest(req), req.params);
    return reply.status(200).send(Presenter.wrapper(session));
  }

  public async searchMe(req: FastifyRequest<{ Querystring: SearchMeSessionDto }>, reply: FastifyReply): Promise<void> {
    const result: SessionSearchResult = await this.searchMeSessionUsecase.execute(ContextFactory.fromRequest(req), req.query);

    return reply.status(200).send(
      CollectionPresenter.wrapper(result.items.map(SessionOutputMapper.toOutput), {
        currentPage: result.page,
        perPage: result.perPage,
        lastPage: result.lastPage(),
        total: result.total,
      }),
    );
  }

  public async create(req: FastifyRequest<{ Body: CreateSessionDto }>, reply: FastifyReply): Promise<void> {
    const tokens: TokenPairOutput = await this.createSessionUsecase.execute(ContextFactory.fromRequest(req), req.body);

    reply.setCookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
      path: REFRESH_TOKEN_COOKIE_PATH,
      httpOnly: true,
      secure: this.envService.getEnv() === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
    });

    return reply.status(201).send(Presenter.wrapper({ accessToken: tokens.accessToken }));
  }

  public async refresh(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const refreshToken: string | undefined = typeof req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] === 'string' ? req.cookies[REFRESH_TOKEN_COOKIE_NAME] : undefined;

    if (!refreshToken) {
      throw new UnauthorizedError();
    }

    const tokens: TokenPairOutput = await this.refreshSessionUsecase.execute(ContextFactory.fromRequest(req), { refreshToken });

    reply.setCookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
      path: REFRESH_TOKEN_COOKIE_PATH,
      httpOnly: true,
      secure: this.envService.getEnv() === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
    });

    return reply.status(200).send(Presenter.wrapper({ accessToken: tokens.accessToken }));
  }

  public async revokeMe(req: FastifyRequest<{ Params: RevokeMeSessionParamsDto }>, reply: FastifyReply): Promise<void> {
    await this.revokeMeSessionUsecase.execute(ContextFactory.fromRequest(req), req.params);
    return reply.status(204).send();
  }

  public async revokeMeAll(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.revokeMeAllSessionUsecase.execute(ContextFactory.fromRequest(req));

    reply.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      path: REFRESH_TOKEN_COOKIE_PATH,
    });

    return reply.status(204).send();
  }
}
