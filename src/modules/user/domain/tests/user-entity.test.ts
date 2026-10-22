import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { UserEntity } from '../user-entity.js';
import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';

describe('UserEntity', () => {
  const baseProps = {
    name: 'John Doe',
    cpfCnpj: '12345678909',
    email: 'john@example.com',
    phone: '85999999999',
    passwordHash: 'hashed',
    type: UserTypeEnum.MASTER,
  };

  it('should create with default ACTIVE status and timestamps', () => {
    const user = new UserEntity(baseProps);

    assert.equal(user.name, 'John Doe');
    assert.equal(user.email, 'john@example.com');
    assert.equal(user.status, UserStatusEnum.ACTIVE);
    assert.equal(user.isActive(), true);
    assert.equal(user.isInactive(), false);
    assert.ok(user.createdAt instanceof Date);
    assert.ok(user.updatedAt instanceof Date);
    assert.equal(typeof user.id, 'bigint');
  });

  it('should mask sensitive fields in toJSON', () => {
    const user = new UserEntity(baseProps);
    const json = user.toJSON();

    assert.equal(json.cpfCnpj, '********');
    assert.equal(json.passwordHash, '********');
    assert.equal(json.name, 'John Doe');
  });

  it('should inactive and active', () => {
    const user = new UserEntity(baseProps);

    user.inactive();
    assert.equal(user.isInactive(), true);

    user.active();
    assert.equal(user.isActive(), true);
  });

  it('should update fields', () => {
    const user = new UserEntity(baseProps);

    user.update({
      name: 'Jane',
      cpfCnpj: '98765432100',
      email: 'jane@example.com',
      phone: '85988888888',
      type: UserTypeEnum.MODERATOR,
    });

    assert.equal(user.name, 'Jane');
    assert.equal(user.email, 'jane@example.com');
    assert.equal(user.type, UserTypeEnum.MODERATOR);
  });

  it('should update password hash', () => {
    const user = new UserEntity(baseProps);
    user.updatePasswordHash('new-hash');
    assert.equal(user.passwordHash, 'new-hash');
  });

  it('should update status', () => {
    const user = new UserEntity(baseProps);
    user.updateStatus(UserStatusEnum.INACTIVE);
    assert.equal(user.status, UserStatusEnum.INACTIVE);
  });
});
