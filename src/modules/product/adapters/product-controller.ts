import type { ProductOutput } from '../application/outputs/product-output.js';
import type { CreateProductDto } from '../application/dtos/create-product-dto.js';
import type { UpdateProductDto } from '../application/dtos/update-product-dto.js';
import type { SearchProductDto } from '../application/dtos/search-product-dto.js';
import type { GetProductUsecase } from '../application/usecases/get-product-usecase.js';
import type { ProductSearchResult } from '../domain/product-repository.js';
import type { GetProductParamsDto } from '../application/dtos/get-product-dto.js';
import type { SearchProductUsecase } from '../application/usecases/search-product-usecase.js';
import type { UpdateProductUsecase } from '../application/usecases/update-product-usecase.js';
import type { CreateProductUsecase } from '../application/usecases/create-product-usecase.js';
import type { DeleteProductParamsDto } from '../application/dtos/delete-product-dto.js';
import type { DeleteProductUsecase } from '../application/usecases/delete-product-usecase.js';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { ContextFactory } from '#src/adapters/contexts/context.js';

import { ProductOutputMapper } from '../application/outputs/product-output.js';
import { Presenter, CollectionPresenter } from '#src/adapters/presenters/presenter.js';

export class ProductController {
  private readonly createProductUsecase: CreateProductUsecase;
  private readonly getProductUsecase: GetProductUsecase;
  private readonly searchProductUsecase: SearchProductUsecase;
  private readonly updateProductUsecase: UpdateProductUsecase;
  private readonly deleteProductUsecase: DeleteProductUsecase;

  public constructor(
    createProductUsecase: CreateProductUsecase,
    getProductUsecase: GetProductUsecase,
    searchProductUsecase: SearchProductUsecase,
    updateProductUsecase: UpdateProductUsecase,
    deleteProductUsecase: DeleteProductUsecase,
  ) {
    this.createProductUsecase = createProductUsecase;
    this.getProductUsecase = getProductUsecase;
    this.searchProductUsecase = searchProductUsecase;
    this.updateProductUsecase = updateProductUsecase;
    this.deleteProductUsecase = deleteProductUsecase;
  }

  public async create(req: FastifyRequest<{ Body: CreateProductDto }>, reply: FastifyReply): Promise<void> {
    const product: ProductOutput = await this.createProductUsecase.execute(ContextFactory.fromRequest(req), req.body);
    return reply.status(201).send(Presenter.wrapper(product));
  }

  public async get(req: FastifyRequest<{ Params: GetProductParamsDto }>, reply: FastifyReply): Promise<void> {
    const product: ProductOutput = await this.getProductUsecase.execute(req.params);
    return reply.status(200).send(Presenter.wrapper(product));
  }

  public async search(req: FastifyRequest<{ Querystring: SearchProductDto }>, reply: FastifyReply): Promise<void> {
    const result: ProductSearchResult = await this.searchProductUsecase.execute(req.query);

    return reply.status(200).send(
      CollectionPresenter.wrapper(result.items.map(ProductOutputMapper.toOutput), {
        currentPage: result.page,
        perPage: result.perPage,
        lastPage: result.lastPage(),
        total: result.total,
      }),
    );
  }

  public async update(req: FastifyRequest<{ Params: Pick<UpdateProductDto, 'id'>; Body: Omit<UpdateProductDto, 'id'> }>, reply: FastifyReply): Promise<void> {
    const product: ProductOutput = await this.updateProductUsecase.execute(ContextFactory.fromRequest(req), { ...req.params, ...req.body });
    return reply.status(200).send(Presenter.wrapper(product));
  }

  public async delete(req: FastifyRequest<{ Params: DeleteProductParamsDto }>, reply: FastifyReply): Promise<void> {
    await this.deleteProductUsecase.execute(ContextFactory.fromRequest(req), req.params);
    return reply.status(204).send();
  }
}
