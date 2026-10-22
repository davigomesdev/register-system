import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createUserSchema } from '../create-user-dto.js';
import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';

describe('createUserSchema', () => {
  const valid = {
    name: 'John Doe',
    cpfCnpj: '52998224725',
    email: 'john@example.com',
    phone: '+5585999999999',
    password: 'password1',
    type: UserTypeEnum.MASTER,
  };

  it('should accept valid input', () => {
    assert.equal(createUserSchema.safeParse(valid).success, true);
  });

  it('should reject empty name', () => {
    assert.equal(createUserSchema.safeParse({ ...valid, name: '' }).success, false);
  });

  it('should reject invalid email', () => {
    assert.equal(createUserSchema.safeParse({ ...valid, email: 'not-email' }).success, false);
  });

  it('should reject short password', () => {
    assert.equal(createUserSchema.safeParse({ ...valid, password: '123' }).success, false);
  });

  it('should reject invalid cpfCnpj', () => {
    assert.equal(createUserSchema.safeParse({ ...valid, cpfCnpj: '000' }).success, false);
  });
});
