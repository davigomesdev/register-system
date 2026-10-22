import assert from 'node:assert/strict';
import { describe, it, beforeEach, mock } from 'node:test';
import { Decimal } from 'decimal.js';

import { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';
import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { CreateProductUsecase } from '../create-product-usecase.js';

describe('CreateProductUsecase', () => {
  const persistenceService = {
    begin: mock.fn(async (fn: (tx: unknown) => Promise<void>) => fn({})),
  };
  const auditLogProvider = {
    logTx: mock.fn(),
  };
  const productRepository = {
    createTx: mock.fn(),
  };
  const ctx = {
    requestId: 'req-1',
    actorId: 1n,
    actorType: ActorTypeEnum.USER,
    ip: '127.0.0.1',
    userAgent: null,
    deviceInfo: null,
    log: console,
  };

  let usecase: CreateProductUsecase;

  beforeEach(() => {
    persistenceService.begin.mock.resetCalls();
    auditLogProvider.logTx.mock.resetCalls();
    productRepository.createTx.mock.resetCalls();
    usecase = new CreateProductUsecase(persistenceService as never, auditLogProvider as never, productRepository as never);
  });

  it('should create product and write audit log', async () => {
    const output = await usecase.execute(ctx as never, {
      sku: 'SKU-001',
      name: 'Product',
      slug: 'product',
      description: 'desc',
      costPrice: new Decimal('10.50'),
      gender: ProductGenderEnum.MALE,
    });

    assert.equal(productRepository.createTx.mock.callCount(), 1);
    assert.equal(auditLogProvider.logTx.mock.callCount(), 1);

    const logArg = auditLogProvider.logTx.mock.calls[0]?.arguments[2] as { action: string; resource: string };
    assert.equal(logArg.action, AuditLogActionEnum.CREATE);
    assert.equal(logArg.resource, AuditLogResourceEnum.PRODUCT);
    assert.equal(output.sku, 'SKU-001');
    assert.equal(output.name, 'Product');
  });
});
