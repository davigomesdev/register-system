import assert from 'node:assert/strict';
import { describe, it, after } from 'node:test';
import { Decimal } from 'decimal.js';

import { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';
import { ProductEntity } from '#src/modules/product/domain/product-entity.js';
import { ProductSearchParams } from '#src/modules/product/domain/product-repository.js';
import { ProductPersistenceRepository } from '#src/modules/product/infra/product-persistence-repository.js';

import {
  hasIntegrationDb,
  createIntegrationEnv,
  createIntegrationPersistence,
  cleanupProduct,
} from './helpers.js';

const run = hasIntegrationDb() ? describe : describe.skip;

run('Integration ProductPersistenceRepository', () => {
  const envService = createIntegrationEnv();
  const persistenceService = createIntegrationPersistence(envService);
  const repo = new ProductPersistenceRepository(persistenceService);

  const createdIds: bigint[] = [];

  after(async () => {
    const pool = persistenceService.getPool();
    for (const id of createdIds) {
      await cleanupProduct(pool, id);
    }
    await pool.end();
  });

  it('should create, get, search, update and soft delete', async () => {
    const product = new ProductEntity({
      sku: `SKU-INT-${Date.now()}`,
      name: 'Integration Product',
      slug: 'integration-product',
      description: 'test',
      costPrice: new Decimal('12.3456'),
      gender: ProductGenderEnum.MALE,
    });
    createdIds.push(product.id);

    await persistenceService.begin(async (tx) => {
      await repo.createTx(tx, product);
    });

    const found = await repo.get(product.id);
    assert.equal(found.sku, product.sku);
    assert.equal(found.name, 'Integration Product');
    assert.equal(found.costPrice.toString(), '12.3456');

    const search = await repo.search(
      new ProductSearchParams({ filter: { search: 'Integration Product', gender: null }, options: {} }),
    );
    assert.ok(search.total >= 1);

    found.update({
      sku: found.sku,
      name: 'Updated Product',
      slug: found.slug,
      description: found.description,
      costPrice: new Decimal('20'),
      gender: ProductGenderEnum.FEMALE,
    });
    await persistenceService.begin(async (tx) => {
      await repo.updateTx(tx, found);
    });

    const updated = await repo.get(product.id);
    assert.equal(updated.name, 'Updated Product');
    assert.equal(updated.gender, ProductGenderEnum.FEMALE);

    updated.softDelete();
    await persistenceService.begin(async (tx) => {
      await repo.softDeleteTx(tx, updated);
    });

    await assert.rejects(() => repo.get(product.id));
  });
});
