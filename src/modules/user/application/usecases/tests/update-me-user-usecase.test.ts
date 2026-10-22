import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';

import { UserEntity } from '../../../domain/user-entity.js';
import { UpdateMeUsecase } from '../update-me-usecase.js';

describe('UpdateMeUsecase', () => {
  it('should update current user profile', async () => {
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
      actorId: user.id,
      actorType: ActorTypeEnum.USER,
      ip: null,
      userAgent: null,
      deviceInfo: null,
      log: console,
    };

    const usecase = new UpdateMeUsecase(persistenceService as never, auditLogProvider as never, userRepository as never);
    const output = await usecase.execute(ctx as never, {
      name: 'Me',
      cpfCnpj: '12345678909',
      email: 'me@example.com',
      phone: '85999999999',
    });

    assert.equal(userRepository.get.mock.callCount(), 1);
    assert.equal((userRepository.get.mock.calls as Array<{ arguments: unknown[] }>)[0]?.arguments[0], user.id);
    assert.equal(output.name, 'Me');
    assert.equal(output.email, 'me@example.com');
  });
});
