import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { AuditLogProvider } from '../audit-log-provider.js';

describe('AuditLogProvider', () => {
  const ctx = {
    requestId: 'req-1',
    actorId: 1n,
    actorType: ActorTypeEnum.USER,
    ip: '127.0.0.1',
    userAgent: 'test',
    deviceInfo: null,
    log: console,
  };

  it('should create single audit log via createTx', async () => {
    const auditLogRepository = {
      createTx: mock.fn(),
      createBatchTx: mock.fn(),
    };

    const provider = new AuditLogProvider(auditLogRepository as never);

    await provider.logTx({} as never, ctx as never, {
      resourceId: 10n,
      action: AuditLogActionEnum.CREATE,
      resource: AuditLogResourceEnum.USER,
      after: { id: '10' },
    });

    assert.equal(auditLogRepository.createTx.mock.callCount(), 1);
    assert.equal(auditLogRepository.createBatchTx.mock.callCount(), 0);

    const entity = auditLogRepository.createTx.mock.calls[0]?.arguments[1] as {
      actorId: bigint | null;
      action: string;
      resource: string;
    };
    assert.equal(entity.actorId, 1n);
    assert.equal(entity.action, AuditLogActionEnum.CREATE);
    assert.equal(entity.resource, AuditLogResourceEnum.USER);
  });

  it('should create batch via createBatchTx', async () => {
    const auditLogRepository = {
      createTx: mock.fn(),
      createBatchTx: mock.fn(),
    };

    const provider = new AuditLogProvider(auditLogRepository as never);

    await provider.logTx({} as never, ctx as never, [
      { action: AuditLogActionEnum.CREATE, resource: AuditLogResourceEnum.USER },
      { action: AuditLogActionEnum.UPDATE, resource: AuditLogResourceEnum.PRODUCT },
    ]);

    assert.equal(auditLogRepository.createBatchTx.mock.callCount(), 1);
    assert.equal(auditLogRepository.createTx.mock.callCount(), 0);

    const batch = auditLogRepository.createBatchTx.mock.calls[0]?.arguments[1] as unknown[];
    assert.equal(batch.length, 2);
  });
});
