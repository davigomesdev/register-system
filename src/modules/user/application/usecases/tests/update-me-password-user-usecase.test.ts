import assert from 'node:assert/strict';
import { describe, it, beforeEach, mock } from 'node:test';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';

import { UnauthorizedError } from '#src/domain/errors/unauthorized-error.js';

import { UserEntity } from '../../../domain/user-entity.js';
import { UpdateMePasswordUsecase } from '../update-me-password-usecase.js';

describe('UpdateMePasswordUsecase', () => {
  const user = new UserEntity({
    name: 'John',
    cpfCnpj: '12345678909',
    email: 'john@example.com',
    phone: '85999999999',
    passwordHash: 'old-hash',
    type: UserTypeEnum.MASTER,
  });

  const persistenceService = {
    begin: mock.fn(async (fn: (tx: unknown) => Promise<void>) => fn({})),
  };
  const hashProvider = {
    verifyPassword: mock.fn(async (): Promise<boolean> => false),
    hashPassword: mock.fn(async (): Promise<string> => 'new-hash'),
  };
  const auditLogProvider = { logTx: mock.fn() };
  const userRepository = {
    get: mock.fn(async () => user),
    updatePasswordHashTx: mock.fn(),
  };
  const ctx = {
    requestId: null,
    actorId: user.id,
    actorType: ActorTypeEnum.USER,
    ip: null,
    userAgent: null,
    deviceInfo: null,
    log: console,
  };

  beforeEach(() => {
    hashProvider.verifyPassword.mock.resetCalls();
    hashProvider.hashPassword.mock.resetCalls();
    userRepository.updatePasswordHashTx.mock.resetCalls();
  });

  it('should update password when old password is valid', async () => {
    hashProvider.verifyPassword.mock.mockImplementation(async () => true);

    const usecase = new UpdateMePasswordUsecase(persistenceService as never, hashProvider as never, auditLogProvider as never, userRepository as never);

    await usecase.execute(ctx as never, { oldPassword: 'old', newPassword: 'newpassword' });

    assert.equal(hashProvider.verifyPassword.mock.callCount(), 1);
    assert.equal(hashProvider.hashPassword.mock.callCount(), 1);
    assert.equal(userRepository.updatePasswordHashTx.mock.callCount(), 1);
  });

  it('should throw UnauthorizedError when old password is invalid', async () => {
    hashProvider.verifyPassword.mock.mockImplementation(async () => false);

    const usecase = new UpdateMePasswordUsecase(persistenceService as never, hashProvider as never, auditLogProvider as never, userRepository as never);

    await assert.rejects(() => usecase.execute(ctx as never, { oldPassword: 'wrong', newPassword: 'newpassword' }), UnauthorizedError);
    assert.equal(userRepository.updatePasswordHashTx.mock.callCount(), 0);
  });
});
