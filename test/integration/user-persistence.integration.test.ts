import assert from 'node:assert/strict';
import { describe, it, after } from 'node:test';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';
import { UserEntity } from '#src/modules/user/domain/user-entity.js';
import { UserSearchParams } from '#src/modules/user/domain/user-repository.js';
import { UserPersistenceRepository } from '#src/modules/user/infra/user-persistence-repository.js';

import {
  hasIntegrationDb,
  createIntegrationEnv,
  createIntegrationPersistence,
  createIntegrationEncryption,
  cleanupUser,
} from './helpers.js';

const run = hasIntegrationDb() ? describe : describe.skip;

run('Integration UserPersistenceRepository', () => {
  const envService = createIntegrationEnv();
  const persistenceService = createIntegrationPersistence(envService);
  const encryptionService = createIntegrationEncryption(envService);
  const repo = new UserPersistenceRepository(encryptionService, persistenceService);

  const createdIds: bigint[] = [];

  after(async () => {
    const pool = persistenceService.getPool();
    for (const id of createdIds) {
      await cleanupUser(pool, id);
    }
    await pool.end();
  });

  it('should create, get, getByEmail, search, update and update status', async () => {
    const email = `int-user-${Date.now()}@example.com`;
    const user = new UserEntity({
      name: 'Integration User',
      cpfCnpj: '52998224725',
      email,
      phone: '+5585999999999',
      passwordHash: 'hashed',
      type: UserTypeEnum.MODERATOR,
      status: UserStatusEnum.ACTIVE,
    });
    createdIds.push(user.id);

    await persistenceService.begin(async (tx) => {
      await repo.createTx(tx, user);
    });

    const found = await repo.get(user.id);
    assert.equal(found.email, email);
    assert.equal(found.cpfCnpj, '52998224725');

    const byEmail = await repo.getByEmail(email);
    assert.equal(byEmail.id, user.id);

    const search = await repo.search(
      new UserSearchParams({
        filter: { search: 'Integration User', type: null, status: null },
        options: {},
      }),
    );
    assert.ok(search.total >= 1);

    found.update({
      name: 'Updated User',
      cpfCnpj: found.cpfCnpj!,
      email: found.email,
      phone: found.phone,
      type: UserTypeEnum.MASTER,
    });
    await persistenceService.begin(async (tx) => {
      await repo.updateTx(tx, found);
    });

    const updated = await repo.get(user.id);
    assert.equal(updated.name, 'Updated User');
    assert.equal(updated.type, UserTypeEnum.MASTER);

    updated.updateStatus(UserStatusEnum.INACTIVE);
    await persistenceService.begin(async (tx) => {
      await repo.updateStatusTx(tx, updated);
    });

    const inactive = await repo.get(user.id);
    assert.equal(inactive.status, UserStatusEnum.INACTIVE);
  });
});
