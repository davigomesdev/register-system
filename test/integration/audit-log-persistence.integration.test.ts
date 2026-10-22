import assert from 'node:assert/strict';
import { describe, it, after } from 'node:test';

import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';
import { AuditLogEntity } from '#src/modules/audit-log/domain/audit-log-entity.js';
import { AuditLogSearchParams } from '#src/modules/audit-log/domain/audit-log-repository.js';
import { AuditLogPersistenceRepository } from '#src/modules/audit-log/infra/audit-log-persistence-repository.js';

import {
  hasIntegrationDb,
  createIntegrationEnv,
  createIntegrationPersistence,
  createIntegrationEncryption,
  cleanupAuditLog,
} from './helpers.js';

const run = hasIntegrationDb() ? describe : describe.skip;

run('Integration AuditLogPersistenceRepository', () => {
  const envService = createIntegrationEnv();
  const persistenceService = createIntegrationPersistence(envService);
  const encryptionService = createIntegrationEncryption(envService);
  const repo = new AuditLogPersistenceRepository(encryptionService, persistenceService);

  const createdIds: bigint[] = [];

  after(async () => {
    const pool = persistenceService.getPool();
    for (const id of createdIds) {
      await cleanupAuditLog(pool, id);
    }
    await pool.end();
  });

  it('should create, get and search', async () => {
    const auditLog = new AuditLogEntity({
      actorId: null,
      resourceId: null,
      actorType: ActorTypeEnum.SYSTEM,
      action: AuditLogActionEnum.CREATE,
      resource: AuditLogResourceEnum.PRODUCT,
      after: { name: 'integration' },
      metadata: { source: 'integration-test' },
    });
    createdIds.push(auditLog.id);

    await persistenceService.begin(async (tx) => {
      await repo.createTx(tx, auditLog);
    });

    const found = await repo.get(auditLog.id);
    assert.equal(found.action, AuditLogActionEnum.CREATE);
    assert.equal(found.resource, AuditLogResourceEnum.PRODUCT);
    assert.deepEqual(found.after, { name: 'integration' });

    const search = await repo.search(
      new AuditLogSearchParams({
        filter: { action: AuditLogActionEnum.CREATE, resource: AuditLogResourceEnum.PRODUCT },
        options: {},
      }),
    );
    assert.ok(search.total >= 1);
    assert.ok(search.items.some((a) => a.id === auditLog.id));
  });
});
