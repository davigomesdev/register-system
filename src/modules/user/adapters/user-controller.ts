import type { UserOutput } from '../application/outputs/user-output.js';
import type { UpdateMeDto } from '../application/dtos/update-me-dto.js';
import type { CreateUserDto } from '../application/dtos/create-user-dto.js';
import type { UpdateUserDto } from '../application/dtos/update-user-dto.js';
import type { SearchUserDto } from '../application/dtos/search-user-dto.js';
import type { GetUserUsecase } from '../application/usecases/get-user-usecase.js';
import type { UpdateMeUsecase } from '../application/usecases/update-me-usecase.js';
import type { GetMeUserUsecase } from '../application/usecases/get-me-user-usecase.js';
import type { UserSearchResult } from '../domain/user-repository.js';
import type { GetUserParamsDto } from '../application/dtos/get-user-dto.js';
import type { SearchUserUsecase } from '../application/usecases/search-user-usecase.js';
import type { UpdateUserUsecase } from '../application/usecases/update-user-usecase.js';
import type { CreateUserUsecase } from '../application/usecases/create-user-usecase.js';
import type { UpdateStatusUserDto } from '../application/dtos/update-status-user-dto.js';
import type { UpdateMePasswordDto } from '../application/dtos/update-me-password-dto.js';
import type { UpdateMePasswordUsecase } from '../application/usecases/update-me-password-usecase.js';
import type { UpdateStatusUserUsecase } from '../application/usecases/update-status-user-usecase.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { ContextFactory } from '#src/adapters/contexts/context.js';

import { UserOutputMapper } from '../application/outputs/user-output.js';
import { Presenter, CollectionPresenter } from '#src/adapters/presenters/presenter.js';

export class UserController {
  private readonly createUserUsecase: CreateUserUsecase;
  private readonly getUserUsecase: GetUserUsecase;
  private readonly getMeUserUsecase: GetMeUserUsecase;
  private readonly searchUserUsecase: SearchUserUsecase;
  private readonly updateUserUsecase: UpdateUserUsecase;
  private readonly updateMeUsecase: UpdateMeUsecase;
  private readonly updateMePasswordUsecase: UpdateMePasswordUsecase;
  private readonly updateStatusUserUsecase: UpdateStatusUserUsecase;

  public constructor(
    createUserUsecase: CreateUserUsecase,
    getUserUsecase: GetUserUsecase,
    getMeUserUsecase: GetMeUserUsecase,
    searchUserUsecase: SearchUserUsecase,
    updateUserUsecase: UpdateUserUsecase,
    updateMeUsecase: UpdateMeUsecase,
    updateMePasswordUsecase: UpdateMePasswordUsecase,
    updateStatusUserUsecase: UpdateStatusUserUsecase,
  ) {
    this.createUserUsecase = createUserUsecase;
    this.getUserUsecase = getUserUsecase;
    this.getMeUserUsecase = getMeUserUsecase;
    this.searchUserUsecase = searchUserUsecase;
    this.updateUserUsecase = updateUserUsecase;
    this.updateMeUsecase = updateMeUsecase;
    this.updateMePasswordUsecase = updateMePasswordUsecase;
    this.updateStatusUserUsecase = updateStatusUserUsecase;
  }

  public async create(req: FastifyRequest<{ Body: CreateUserDto }>, reply: FastifyReply): Promise<void> {
    const user: UserOutput = await this.createUserUsecase.execute(ContextFactory.fromRequest(req), req.body);
    return reply.status(201).send(Presenter.wrapper(user));
  }

  public async get(req: FastifyRequest<{ Params: GetUserParamsDto }>, reply: FastifyReply): Promise<void> {
    const user: UserOutput = await this.getUserUsecase.execute(req.params);
    return reply.status(200).send(Presenter.wrapper(user));
  }

  public async getMe(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user: UserOutput = await this.getMeUserUsecase.execute(ContextFactory.fromRequest(req));
    return reply.status(200).send(Presenter.wrapper(user));
  }

  public async search(req: FastifyRequest<{ Querystring: SearchUserDto }>, reply: FastifyReply): Promise<void> {
    const result: UserSearchResult = await this.searchUserUsecase.execute(req.query);

    return reply.status(200).send(
      CollectionPresenter.wrapper(result.items.map(UserOutputMapper.toOutput), {
        currentPage: result.page,
        perPage: result.perPage,
        lastPage: result.lastPage(),
        total: result.total,
      }),
    );
  }

  public async update(req: FastifyRequest<{ Params: Pick<UpdateUserDto, 'id'>; Body: Omit<UpdateUserDto, 'id'> }>, reply: FastifyReply): Promise<void> {
    const user: UserOutput = await this.updateUserUsecase.execute(ContextFactory.fromRequest(req), { ...req.params, ...req.body });
    return reply.status(200).send(Presenter.wrapper(user));
  }

  public async updateMe(req: FastifyRequest<{ Body: UpdateMeDto }>, reply: FastifyReply): Promise<void> {
    const user: UserOutput = await this.updateMeUsecase.execute(ContextFactory.fromRequest(req), req.body);
    return reply.status(200).send(Presenter.wrapper(user));
  }

  public async updateMePassword(req: FastifyRequest<{ Body: UpdateMePasswordDto }>, reply: FastifyReply): Promise<void> {
    await this.updateMePasswordUsecase.execute(ContextFactory.fromRequest(req), req.body);
    return reply.status(204).send();
  }

  public async updateStatus(req: FastifyRequest<{ Params: Pick<UpdateStatusUserDto, 'id'>; Body: Omit<UpdateStatusUserDto, 'id'> }>, reply: FastifyReply): Promise<void> {
    const user: UserOutput = await this.updateStatusUserUsecase.execute(ContextFactory.fromRequest(req), { ...req.params, ...req.body });
    return reply.status(200).send(Presenter.wrapper(user));
  }
}
