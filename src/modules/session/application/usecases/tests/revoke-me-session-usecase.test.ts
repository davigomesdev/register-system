import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { SessionEntity } from '../../../domain/session-entity.js';
import { RevokeMeSessionUsecase } from '../revoke-me-session-usecase.js';

describe('RevokeMeSessionUsecase', () => {
  it('should revoke session and write audit log', async () => {
    const session = new SessionEntity({
      userId: 1n,
      refreshTokenHash: 'hash',
    });

    const persistenceService = {
      begin: mock.fn(async (fn: (tx: unknown) => Promise<void>) => fn({})),
    };
    const auditLogProvider = { logTx: mock.fn() };
    const sessionRepository = {
      getByIdAndUserId: mock.fn(async () => session),
      revokeTx: mock.fn(),
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

    const usecase = new RevokeMeSessionUsecase(persistenceService as never, auditLogProvider as never, sessionRepository as never);
    await usecase.execute(ctx as never, { id: session.id });

    assert.equal(sessionRepository.revokeTx.mock.callCount(), 1);
    assert.equal(auditLogProvider.logTx.mock.callCount(), 1);
    const logArg = auditLogProvider.logTx.mock.calls[0]?.arguments[2] as { action: string; resource: string };
    assert.equal(logArg.action, AuditLogActionEnum.UPDATE);
    assert.equal(logArg.resource, AuditLogResourceEnum.SESSION);
    assert.ok(session.revokedAt instanceof Date);
  });
});
