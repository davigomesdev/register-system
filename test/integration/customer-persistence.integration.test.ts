import assert from 'node:assert/strict';
import { describe, it, after, before } from 'node:test';

import { CustomerEntity } from '#src/modules/customer/domain/customer-entity.js';
import { CustomerSearchParams } from '#src/modules/customer/domain/customer-repository.js';
import { CustomerPersistenceRepository } from '#src/modules/customer/infra/customer-persistence-repository.js';

import {
  hasIntegrationDb,
  createIntegrationEnv,
  createIntegrationPersistence,
  createIntegrationEncryption,
  cleanupCustomer,
} from './helpers.js';

const run = hasIntegrationDb() ? describe : describe.skip;

run('Integration CustomerPersistenceRepository', () => {
  const envService = createIntegrationEnv();
  const persistenceService = createIntegrationPersistence(envService);
  const encryptionService = createIntegrationEncryption(envService);
  const repo = new CustomerPersistenceRepository(encryptionService, persistenceService);

  const createdIds: bigint[] = [];

  after(async () => {
    const pool = persistenceService.getPool();
    for (const id of createdIds) {
      await cleanupCustomer(pool, id);
    }
    await pool.end();
  });

  it('should create, get, search, update and soft delete', async () => {
    const customer = new CustomerEntity({
      name: 'Integration Customer',
      cpfCnpj: '52998224725',
      email: `int-customer-${Date.now()}@example.com`,
      phone: '+5585999999999',
    });
    createdIds.push(customer.id);

    await persistenceService.begin(async (tx) => {
      await repo.createTx(tx, customer);
    });

    const found = await repo.get(customer.id);
    assert.equal(found.name, 'Integration Customer');
    assert.equal(found.cpfCnpj, '52998224725');
    assert.equal(found.email, customer.email);

    const search = await repo.search(
      new CustomerSearchParams({ filter: { search: 'Integration Customer' }, options: {} }),
    );
    assert.ok(search.total >= 1);
    assert.ok(search.items.some((c) => c.id === customer.id));

    found.update({
      name: 'Updated Customer',
      email: found.email,
      phone: found.phone,
      cpfCnpj: found.cpfCnpj,
    });
    await persistenceService.begin(async (tx) => {
      await repo.updateTx(tx, found);
    });

    const updated = await repo.get(customer.id);
    assert.equal(updated.name, 'Updated Customer');

    updated.softDelete();
    await persistenceService.begin(async (tx) => {
      await repo.softDeleteTx(tx, updated);
    });

    await assert.rejects(() => repo.get(customer.id));
  });
});
