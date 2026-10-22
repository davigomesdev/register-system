import type { CustomerOutput } from '../application/outputs/customer-output.js';
import type { CreateCustomerDto } from '../application/dtos/create-customer-dto.js';
import type { UpdateCustomerDto } from '../application/dtos/update-customer-dto.js';
import type { SearchCustomerDto } from '../application/dtos/search-customer-dto.js';
import type { GetCustomerUsecase } from '../application/usecases/get-customer-usecase.js';
import type { CustomerSearchResult } from '../domain/customer-repository.js';
import type { GetCustomerParamsDto } from '../application/dtos/get-customer-dto.js';
import type { SearchCustomerUsecase } from '../application/usecases/search-customer-usecase.js';
import type { UpdateCustomerUsecase } from '../application/usecases/update-customer-usecase.js';
import type { CreateCustomerUsecase } from '../application/usecases/create-customer-usecase.js';
import type { DeleteCustomerUsecase } from '../application/usecases/delete-customer-usecase.js';
import type { DeleteCustomerParamsDto } from '../application/dtos/delete-customer-dto.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { ContextFactory } from '#src/adapters/contexts/context.js';

import { CustomerOutputMapper } from '../application/outputs/customer-output.js';
import { Presenter, CollectionPresenter } from '#src/adapters/presenters/presenter.js';

export class CustomerController {
  private readonly createCustomerUsecase: CreateCustomerUsecase;
  private readonly getCustomerUsecase: GetCustomerUsecase;
  private readonly searchCustomerUsecase: SearchCustomerUsecase;
  private readonly updateCustomerUsecase: UpdateCustomerUsecase;
  private readonly deleteCustomerUsecase: DeleteCustomerUsecase;

  public constructor(
    createCustomerUsecase: CreateCustomerUsecase,
    getCustomerUsecase: GetCustomerUsecase,
    searchCustomerUsecase: SearchCustomerUsecase,
    updateCustomerUsecase: UpdateCustomerUsecase,
    deleteCustomerUsecase: DeleteCustomerUsecase,
  ) {
    this.createCustomerUsecase = createCustomerUsecase;
    this.getCustomerUsecase = getCustomerUsecase;
    this.searchCustomerUsecase = searchCustomerUsecase;
    this.updateCustomerUsecase = updateCustomerUsecase;
    this.deleteCustomerUsecase = deleteCustomerUsecase;
  }

  public async create(req: FastifyRequest<{ Body: CreateCustomerDto }>, reply: FastifyReply): Promise<void> {
    const customer: CustomerOutput = await this.createCustomerUsecase.execute(ContextFactory.fromRequest(req), req.body);
    return reply.status(201).send(Presenter.wrapper(customer));
  }

  public async get(req: FastifyRequest<{ Params: GetCustomerParamsDto }>, reply: FastifyReply): Promise<void> {
    const customer: CustomerOutput = await this.getCustomerUsecase.execute(req.params);
    return reply.status(200).send(Presenter.wrapper(customer));
  }

  public async search(req: FastifyRequest<{ Querystring: SearchCustomerDto }>, reply: FastifyReply): Promise<void> {
    const result: CustomerSearchResult = await this.searchCustomerUsecase.execute(req.query);

    return reply.status(200).send(
      CollectionPresenter.wrapper(result.items.map(CustomerOutputMapper.toOutput), {
        currentPage: result.page,
        perPage: result.perPage,
        lastPage: result.lastPage(),
        total: result.total,
      }),
    );
  }

  public async update(req: FastifyRequest<{ Params: Pick<UpdateCustomerDto, 'id'>; Body: Omit<UpdateCustomerDto, 'id'> }>, reply: FastifyReply): Promise<void> {
    const customer: CustomerOutput = await this.updateCustomerUsecase.execute(ContextFactory.fromRequest(req), { ...req.params, ...req.body });
    return reply.status(200).send(Presenter.wrapper(customer));
  }

  public async delete(req: FastifyRequest<{ Params: DeleteCustomerParamsDto }>, reply: FastifyReply): Promise<void> {
    await this.deleteCustomerUsecase.execute(ContextFactory.fromRequest(req), req.params);
    return reply.status(204).send();
  }
}
