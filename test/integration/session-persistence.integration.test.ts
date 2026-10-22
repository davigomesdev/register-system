import assert from 'node:assert/strict';
import { describe, it, after } from 'node:test';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';
import { UserEntity } from '#src/modules/user/domain/user-entity.js';
import { SessionEntity } from '#src/modules/session/domain/session-entity.js';
import { SessionSearchParams } from '#src/modules/session/domain/session-repository.js';
import { UserPersistenceRepository } from '#src/modules/user/infra/user-persistence-repository.js';
import { SessionPersistenceRepository } from '#src/modules/session/infra/session-persistence-repository.js';

import {
  hasIntegrationDb,
  createIntegrationEnv,
  createIntegrationPersistence,
  createIntegrationEncryption,
  cleanupUser,
} from './helpers.js';

const run = hasIntegrationDb() ? describe : describe.skip;

run('Integration SessionPersistenceRepository', () => {
  const envService = createIntegrationEnv();
  const persistenceService = createIntegrationPersistence(envService);
  const encryptionService = createIntegrationEncryption(envService);
  const userRepo = new UserPersistenceRepository(encryptionService, persistenceService);
  const sessionRepo = new SessionPersistenceRepository(persistenceService);

  const userIds: bigint[] = [];

  after(async () => {
    const pool = persistenceService.getPool();
    for (const id of userIds) {
      await cleanupUser(pool, id);
    }
    await pool.end();
  });

  it('should create session, get by id/user, search and revoke', async () => {
    const user = new UserEntity({
      name: 'Session User',
      cpfCnpj: '52998224725',
      email: `session-user-${Date.now()}@example.com`,
      phone: '+5585999999999',
      passwordHash: 'hash',
      type: UserTypeEnum.MODERATOR,
      status: UserStatusEnum.ACTIVE,
    });
    userIds.push(user.id);

    await persistenceService.begin(async (tx) => {
      await userRepo.createTx(tx, user);
    });

    const session = new SessionEntity({
      userId: user.id,
      refreshTokenHash: `hash-${Date.now()}`,
      ipAddress: '127.0.0.1',
      userAgent: 'integration-test',
    });

    await persistenceService.begin(async (tx) => {
      await sessionRepo.createTx(tx, session);
    });

    const byId = await sessionRepo.getByIdAndUserId(session.id, user.id);
    assert.equal(byId.userId, user.id);
    assert.equal(byId.refreshTokenHash, session.refreshTokenHash);
    assert.ok(byId.isActive());

    const byHash = await sessionRepo.getByRefreshTokenHash(session.refreshTokenHash);
    assert.equal(byHash.id, session.id);

    const search = await sessionRepo.search(
      new SessionSearchParams({ filter: { userId: user.id }, options: {} }),
    );
    assert.ok(search.total >= 1);

    byId.revoke();
    await persistenceService.begin(async (tx) => {
      await sessionRepo.revokeTx(tx, byId);
    });

    const revoked = await sessionRepo.getByIdAndUserId(session.id, user.id);
    assert.equal(revoked.isActive(), false);
  });
});
