import type { Context } from '#src/adapters/contexts/context.js';
import type { PoolClient } from 'pg';
import type { ProductEntity } from '../../domain/product-entity.js';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { ProductRepository } from '../../domain/product-repository.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';
import type { DeleteProductParamsDto } from '../dtos/delete-product-dto.js';

import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

export class DeleteProductUsecase {
  private readonly persistenceService: IPersistenceService;
  private readonly auditLogProvider: AuditLogProvider;
  private readonly productRepository: ProductRepository;

  public constructor(persistenceService: IPersistenceService, auditLogProvider: AuditLogProvider, productRepository: ProductRepository) {
    this.persistenceService = persistenceService;
    this.auditLogProvider = auditLogProvider;
    this.productRepository = productRepository;
  }

  public async execute(ctx: Context, input: DeleteProductParamsDto): Promise<void> {
    const product: ProductEntity = await this.productRepository.get(input.id);

    const before: Record<string, unknown> = product.toJSON();
    product.softDelete();

    await this.persistenceService.begin(async (tx: PoolClient) => {
      await this.productRepository.softDeleteTx(tx, product);

      await this.auditLogProvider.logTx(tx, ctx, {
        resourceId: product.id,
        action: AuditLogActionEnum.DELETE,
        resource: AuditLogResourceEnum.PRODUCT,
        before,
        after: product.toJSON(),
      });
    });
  }
}
