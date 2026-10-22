import type { Context } from '#src/adapters/contexts/context.js';
import type { PoolClient } from 'pg';
import type { ProductOutput } from '../outputs/product-output.js';
import type { CreateProductDto } from '../dtos/create-product-dto.js';
import type { ProductRepository } from '../../domain/product-repository.js';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';

import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { ProductEntity } from '../../domain/product-entity.js';
import { ProductOutputMapper } from '../outputs/product-output.js';

export class CreateProductUsecase {
  private readonly persistenceService: IPersistenceService;
  private readonly auditLogProvider: AuditLogProvider;
  private readonly productRepository: ProductRepository;

  public constructor(persistenceService: IPersistenceService, auditLogProvider: AuditLogProvider, productRepository: ProductRepository) {
    this.persistenceService = persistenceService;
    this.auditLogProvider = auditLogProvider;
    this.productRepository = productRepository;
  }

  public async execute(ctx: Context, input: CreateProductDto): Promise<ProductOutput> {
    const product: ProductEntity = new ProductEntity(input);

    await this.persistenceService.begin(async (tx: PoolClient) => {
      await this.productRepository.createTx(tx, product);

      await this.auditLogProvider.logTx(tx, ctx, {
        resourceId: product.id,
        action: AuditLogActionEnum.CREATE,
        resource: AuditLogResourceEnum.PRODUCT,
        after: product.toJSON(),
      });
    });

    return ProductOutputMapper.toOutput(product);
  }
}
