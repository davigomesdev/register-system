import type { IJwtService } from '#src/infra/jwt/jwt-service.js';
import type { FastifyInstance } from 'fastify';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { ProductRepository } from '../domain/product-repository.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';

import { SubjectTypeEnum } from '#src/domain/enums/subject-type-enum.js';

import { searchProductSchema } from '../application/dtos/search-product-dto.js';
import { createProductSchema } from '../application/dtos/create-product-dto.js';
import { getProductParamsSchema } from '../application/dtos/get-product-dto.js';
import { deleteProductParamsSchema } from '../application/dtos/delete-product-dto.js';
import { updateProductParamsSchema, updateProductBodySchema } from '../application/dtos/update-product-dto.js';

import { JwtGuard } from '#src/adapters/middlewares/jwt-guard.js';
import { ProductController } from './product-controller.js';

import { CreateProductUsecase } from '../application/usecases/create-product-usecase.js';
import { GetProductUsecase } from '../application/usecases/get-product-usecase.js';
import { SearchProductUsecase } from '../application/usecases/search-product-usecase.js';
import { UpdateProductUsecase } from '../application/usecases/update-product-usecase.js';
import { DeleteProductUsecase } from '../application/usecases/delete-product-usecase.js';

export class ProductRoutes {
  public static register(
    app: FastifyInstance,
    jwtService: IJwtService,
    persistenceService: IPersistenceService,
    auditLogProvider: AuditLogProvider,
    productRepository: ProductRepository,
  ): void {
    const createProductUsecase: CreateProductUsecase = new CreateProductUsecase(persistenceService, auditLogProvider, productRepository);
    const getProductUsecase: GetProductUsecase = new GetProductUsecase(productRepository);
    const searchProductUsecase: SearchProductUsecase = new SearchProductUsecase(productRepository);
    const updateProductUsecase: UpdateProductUsecase = new UpdateProductUsecase(persistenceService, auditLogProvider, productRepository);
    const deleteProductUsecase: DeleteProductUsecase = new DeleteProductUsecase(persistenceService, auditLogProvider, productRepository);

    const productController: ProductController = new ProductController(createProductUsecase, getProductUsecase, searchProductUsecase, updateProductUsecase, deleteProductUsecase);

    app.register(
      async (api: FastifyInstance): Promise<void> => {
        api.addHook('onRequest', new JwtGuard(jwtService, SubjectTypeEnum.USER).handle);

        api.get('', { schema: { querystring: searchProductSchema } }, productController.search.bind(productController));
        api.get('/:id', { schema: { params: getProductParamsSchema } }, productController.get.bind(productController));
        api.post('', { schema: { body: createProductSchema } }, productController.create.bind(productController));
        api.put('/:id', { schema: { params: updateProductParamsSchema, body: updateProductBodySchema } }, productController.update.bind(productController));
        api.delete('/:id', { schema: { params: deleteProductParamsSchema } }, productController.delete.bind(productController));
      },
      { prefix: '/products' },
    );
  }
}
