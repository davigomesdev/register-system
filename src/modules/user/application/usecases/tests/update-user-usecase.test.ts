import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { UserEntity } from '../../../domain/user-entity.js';
import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { UpdateUserUsecase } from '../update-user-usecase.js';

describe('UpdateUserUsecase', () => {
  it('should update user and write audit log', async () => {
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
      updateTx: mock.fn(),
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

    const usecase = new UpdateUserUsecase(persistenceService as never, auditLogProvider as never, userRepository as never);
    const output = await usecase.execute(ctx as never, {
      id: user.id,
      name: 'Jane',
      cpfCnpj: '12345678909',
      email: 'jane@example.com',
      phone: '85988888888',
      type: UserTypeEnum.MODERATOR,
    });

    assert.equal(userRepository.updateTx.mock.callCount(), 1);
    assert.equal(auditLogProvider.logTx.mock.callCount(), 1);
    const logArg = auditLogProvider.logTx.mock.calls[0]?.arguments[2] as { action: string; resource: string };
    assert.equal(logArg.action, AuditLogActionEnum.UPDATE);
    assert.equal(logArg.resource, AuditLogResourceEnum.USER);
    assert.equal(output.name, 'Jane');
  });
});
