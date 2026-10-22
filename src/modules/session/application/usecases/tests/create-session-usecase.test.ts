import assert from 'node:assert/strict';
import { describe, it, beforeEach, mock } from 'node:test';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';
import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { UserEntity } from '#src/modules/user/domain/user-entity.js';
import { CreateSessionUsecase } from '../create-session-usecase.js';

describe('CreateSessionUsecase', () => {
  const user = new UserEntity({
    name: 'John',
    cpfCnpj: '12345678909',
    email: 'john@example.com',
    phone: '85999999999',
    passwordHash: 'hash',
    type: UserTypeEnum.MASTER,
    status: UserStatusEnum.ACTIVE,
  });

  const envService = {
    getRefreshTokenSecretKey: mock.fn(() => 'secret'),
  };
  const jwtService = {
    createToken: mock.fn(async () => 'access-token'),
  };
  const persistenceService = {
    begin: mock.fn(async (fn: (tx: unknown) => Promise<void>) => fn({})),
  };
  const hashProvider = {
    verifyPassword: mock.fn(async () => true),
    generateToken: mock.fn(() => 'refresh-token'),
    hashToken: mock.fn(() => 'refresh-token-hash'),
  };
  const auditLogProvider = {
    logTx: mock.fn(),
  };
  const userRepository = {
    getByEmail: mock.fn(async () => user),
  };
  const sessionRepository = {
    createTx: mock.fn(),
  };
  const ctx = {
    requestId: 'req-1',
    actorId: null,
    actorType: ActorTypeEnum.USER,
    ip: '127.0.0.1',
    userAgent: 'Mozilla',
    deviceInfo: null,
    log: console,
  };

  let usecase: CreateSessionUsecase;

  beforeEach(() => {
    jwtService.createToken.mock.resetCalls();
    persistenceService.begin.mock.resetCalls();
    hashProvider.verifyPassword.mock.resetCalls();
    hashProvider.generateToken.mock.resetCalls();
    hashProvider.hashToken.mock.resetCalls();
    auditLogProvider.logTx.mock.resetCalls();
    userRepository.getByEmail.mock.resetCalls();
    sessionRepository.createTx.mock.resetCalls();
    usecase = new CreateSessionUsecase(
      envService as never,
      jwtService as never,
      persistenceService as never,
      hashProvider as never,
      auditLogProvider as never,
      userRepository as never,
      sessionRepository as never,
    );
  });

  it('should create session and return token pair', async () => {
    const output = await usecase.execute(ctx as never, {
      email: 'john@example.com',
      password: 'password1',
    });

    assert.equal(userRepository.getByEmail.mock.callCount(), 1);
    assert.equal(hashProvider.verifyPassword.mock.callCount(), 1);
    assert.equal(sessionRepository.createTx.mock.callCount(), 1);
    assert.equal(auditLogProvider.logTx.mock.callCount(), 1);
    assert.equal(jwtService.createToken.mock.callCount(), 1);

    const logArg = auditLogProvider.logTx.mock.calls[0]?.arguments[2] as { action: string; resource: string };
    assert.equal(logArg.action, AuditLogActionEnum.CREATE);
    assert.equal(logArg.resource, AuditLogResourceEnum.SESSION);
    assert.equal(output.accessToken, 'access-token');
    assert.equal(output.refreshToken, 'refresh-token');
  });
});
