import assert from 'node:assert/strict';
import { describe, it, beforeEach, mock } from 'node:test';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';
import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';

import { UserEntity } from '#src/modules/user/domain/user-entity.js';
import { SessionEntity } from '../../../domain/session-entity.js';
import { RefreshSessionUsecase } from '../refresh-session-usecase.js';

describe('RefreshSessionUsecase', () => {
  const user = new UserEntity({
    name: 'John',
    cpfCnpj: '12345678909',
    email: 'john@example.com',
    phone: '85999999999',
    passwordHash: 'hash',
    type: UserTypeEnum.MASTER,
    status: UserStatusEnum.ACTIVE,
  });

  const session = new SessionEntity({
    userId: user.id,
    refreshTokenHash: 'old-hash',
  });

  const envService = {
    getRefreshTokenSecretKey: mock.fn(() => 'secret'),
  };
  const jwtService = {
    createToken: mock.fn(async () => 'new-access-token'),
  };
  const persistenceService = {
    begin: mock.fn(async (fn: (tx: unknown) => Promise<void>) => fn({})),
  };
  const hashProvider = {
    hashToken: mock.fn(() => 'old-hash'),
    generateToken: mock.fn(() => 'new-refresh-token'),
  };
  const auditLogProvider = {
    logTx: mock.fn(),
  };
  const userRepository = {
    get: mock.fn(async () => user),
  };
  const sessionRepository = {
    getByRefreshTokenHash: mock.fn(async () => session),
    updateTx: mock.fn(),
    createTx: mock.fn(),
  };
  const ctx = {
    requestId: 'req-1',
    actorId: null,
    actorType: ActorTypeEnum.USER,
    ip: '127.0.0.1',
    userAgent: null,
    deviceInfo: null,
    log: console,
  };

  let usecase: RefreshSessionUsecase;

  beforeEach(() => {
    jwtService.createToken.mock.resetCalls();
    persistenceService.begin.mock.resetCalls();
    hashProvider.hashToken.mock.resetCalls();
    hashProvider.generateToken.mock.resetCalls();
    auditLogProvider.logTx.mock.resetCalls();
    userRepository.get.mock.resetCalls();
    sessionRepository.getByRefreshTokenHash.mock.resetCalls();
    sessionRepository.updateTx.mock.resetCalls();
    sessionRepository.createTx.mock.resetCalls();
    // reset session state
    Object.assign(session, new SessionEntity({ userId: user.id, refreshTokenHash: 'old-hash' }, session.id));
    usecase = new RefreshSessionUsecase(
      envService as never,
      jwtService as never,
      persistenceService as never,
      hashProvider as never,
      auditLogProvider as never,
      userRepository as never,
      sessionRepository as never,
    );
  });

  it('should rotate session and return new token pair', async () => {
    const output = await usecase.execute(ctx as never, { refreshToken: 'old-refresh' });

    assert.equal(sessionRepository.getByRefreshTokenHash.mock.callCount(), 1);
    assert.equal(userRepository.get.mock.callCount(), 1);
    assert.equal(sessionRepository.updateTx.mock.callCount(), 1);
    assert.equal(sessionRepository.createTx.mock.callCount(), 1);
    assert.equal(auditLogProvider.logTx.mock.callCount(), 1);
    assert.equal(jwtService.createToken.mock.callCount(), 1);
    assert.equal(output.accessToken, 'new-access-token');
    assert.equal(output.refreshToken, 'new-refresh-token');
  });
});
