import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { Decimal } from 'decimal.js';

import { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';
import { ProductEntity } from '../../../domain/product-entity.js';
import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { DeleteProductUsecase } from '../delete-product-usecase.js';

describe('DeleteProductUsecase', () => {
  it('should soft delete product and write audit log', async () => {
    const product = new ProductEntity({
      sku: 'SKU-001',
      name: 'Product',
      costPrice: new Decimal('10'),
      gender: ProductGenderEnum.MALE,
    });

    const persistenceService = {
      begin: mock.fn(async (fn: (tx: unknown) => Promise<void>) => fn({})),
    };
    const auditLogProvider = { logTx: mock.fn() };
    const productRepository = {
      get: mock.fn(async () => product),
      softDeleteTx: mock.fn(),
    };
    const ctx = {
      requestId: null,
      actorId: 1n,
      actorType: ActorTypeEnum.USER,
      ip: null,
      userAgent: null,
      deviceInfo: null,
      log: console,
    };

    const usecase = new DeleteProductUsecase(persistenceService as never, auditLogProvider as never, productRepository as never);
    await usecase.execute(ctx as never, { id: product.id });

    assert.equal(productRepository.softDeleteTx.mock.callCount(), 1);
    assert.equal(auditLogProvider.logTx.mock.callCount(), 1);
    const logArg = auditLogProvider.logTx.mock.calls[0]?.arguments[2] as { action: string; resource: string };
    assert.equal(logArg.action, AuditLogActionEnum.DELETE);
    assert.equal(logArg.resource, AuditLogResourceEnum.PRODUCT);
    assert.ok(product.deletedAt instanceof Date);
  });
});
