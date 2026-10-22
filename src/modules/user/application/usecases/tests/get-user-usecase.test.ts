import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';

import { UserEntity } from '../../../domain/user-entity.js';
import { GetUserUsecase } from '../get-user-usecase.js';

describe('GetUserUsecase', () => {
  const user = new UserEntity({
    name: 'John',
    cpfCnpj: '12345678909',
    email: 'john@example.com',
    phone: '85999999999',
    passwordHash: 'hash',
    type: UserTypeEnum.MASTER,
  });

  it('should return user output by id', async () => {
    const userRepository = {
      get: mock.fn(async () => user),
    };
    const usecase = new GetUserUsecase(userRepository as never);
    const output = await usecase.execute({ id: user.id });

    assert.equal(userRepository.get.mock.callCount(), 1);
    assert.equal(output.id, user.id.toString());
    assert.equal(output.email, 'john@example.com');
  });
});
