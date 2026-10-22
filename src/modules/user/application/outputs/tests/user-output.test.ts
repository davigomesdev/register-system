import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';

import { UserEntity } from '../../../domain/user-entity.js';
import { UserOutputMapper } from '../user-output.js';

describe('UserOutputMapper', () => {
  it('should map entity to output', () => {
    const user = new UserEntity({
      name: 'John',
      cpfCnpj: '12345678909',
      email: 'john@example.com',
      phone: '85999999999',
      passwordHash: 'hash',
      type: UserTypeEnum.MASTER,
      status: UserStatusEnum.ACTIVE,
    });

    const output = UserOutputMapper.toOutput(user);

    assert.equal(output.id, user.id.toString());
    assert.equal(output.name, 'John');
    assert.equal(output.email, 'john@example.com');
    assert.equal(output.type, UserTypeEnum.MASTER);
    assert.equal(output.status, UserStatusEnum.ACTIVE);
    assert.equal('passwordHash' in output, false);
  });
});
