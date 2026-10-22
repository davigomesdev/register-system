import assert from 'node:assert/strict';
import { describe, it, beforeEach, mock } from 'node:test';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { CreateUserUsecase } from '../create-user-usecase.js';

describe('CreateUserUsecase', () => {
  const persistenceService = {
    begin: mock.fn(async (fn: (tx: unknown) => Promise<void>) => fn({})),
  };
  const hashProvider = {
    hashPassword: mock.fn(async () => 'hashed-password'),
  };
  const auditLogProvider = {
    logTx: mock.fn(),
  };
  const userRepository = {
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

  let usecase: CreateUserUsecase;

  beforeEach(() => {
    persistenceService.begin.mock.resetCalls();
    hashProvider.hashPassword.mock.resetCalls();
    auditLogProvider.logTx.mock.resetCalls();
    userRepository.createTx.mock.resetCalls();
    usecase = new CreateUserUsecase(persistenceService as never, hashProvider as never, auditLogProvider as never, userRepository as never);
  });

  it('should hash password, create user and write audit log', async () => {
    const output = await usecase.execute(ctx as never, {
      name: 'John',
      cpfCnpj: '12345678909',
      email: 'john@example.com',
      phone: '85999999999',
      password: 'password1',
      type: UserTypeEnum.MASTER,
    });

    assert.equal(hashProvider.hashPassword.mock.callCount(), 1);
    assert.equal(userRepository.createTx.mock.callCount(), 1);
    assert.equal(auditLogProvider.logTx.mock.callCount(), 1);

    const logArg = auditLogProvider.logTx.mock.calls[0]?.arguments[2] as { action: string; resource: string };
    assert.equal(logArg.action, AuditLogActionEnum.CREATE);
    assert.equal(logArg.resource, AuditLogResourceEnum.USER);
    assert.equal(output.email, 'john@example.com');
    assert.equal(output.name, 'John');
  });
});
