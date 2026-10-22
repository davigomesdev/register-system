import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';
import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';

import { UserEntity } from '../../../domain/user-entity.js';
import { UpdateStatusUserUsecase } from '../update-status-user-usecase.js';

describe('UpdateStatusUserUsecase', () => {
  it('should update status and audit', async () => {
    const user = new UserEntity({
      name: 'John',
      cpfCnpj: '12345678909',
      email: 'john@example.com',
      phone: '85999999999',
      passwordHash: 'hash',
      type: UserTypeEnum.MASTER,
    });
    const persistenceService = {
      begin: mock.fn(async (fn: (tx: unknown) => Promise<void>) => fn({})),
    };
    const auditLogProvider = { logTx: mock.fn() };
    const userRepository = {
      get: mock.fn(async () => user),
      updateStatusTx: mock.fn(),
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

    const usecase = new UpdateStatusUserUsecase(persistenceService as never, auditLogProvider as never, userRepository as never);
    const output = await usecase.execute(ctx as never, { id: user.id, status: UserStatusEnum.INACTIVE });

    assert.equal(userRepository.updateStatusTx.mock.callCount(), 1);
    assert.equal(auditLogProvider.logTx.mock.callCount(), 1);
    const logArg = auditLogProvider.logTx.mock.calls[0]?.arguments[2] as { action: string };
    assert.equal(logArg.action, AuditLogActionEnum.UPDATE);
    assert.equal(output.status, UserStatusEnum.INACTIVE);
  });
});
