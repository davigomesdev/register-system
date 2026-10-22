import type { Context } from '#src/adapters/contexts/context.js';
import type { PoolClient } from 'pg';
import type { ProductOutput } from '../outputs/product-output.js';
import type { ProductEntity } from '../../domain/product-entity.js';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { UpdateProductDto } from '../dtos/update-product-dto.js';
import type { ProductRepository } from '../../domain/product-repository.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';

import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { ProductOutputMapper } from '../outputs/product-output.js';

export class UpdateProductUsecase {
  private readonly persistenceService: IPersistenceService;
  private readonly auditLogProvider: AuditLogProvider;
  private readonly productRepository: ProductRepository;

  public constructor(persistenceService: IPersistenceService, auditLogProvider: AuditLogProvider, productRepository: ProductRepository) {
    this.persistenceService = persistenceService;
    this.auditLogProvider = auditLogProvider;
    this.productRepository = productRepository;
  }

  public async execute(ctx: Context, input: UpdateProductDto): Promise<ProductOutput> {
    const product: ProductEntity = await this.productRepository.get(input.id);

    const before: Record<string, unknown> = product.toJSON();
    product.update(input);

    await this.persistenceService.begin(async (tx: PoolClient) => {
      await this.productRepository.updateTx(tx, product);

      await this.auditLogProvider.logTx(tx, ctx, {
        resourceId: product.id,
        action: AuditLogActionEnum.UPDATE,
        resource: AuditLogResourceEnum.PRODUCT,
        before,
        after: product.toJSON(),
      });
    });

    return ProductOutputMapper.toOutput(product);
  }
}
