import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { updateUserBodySchema } from '../update-user-dto.js';

describe('updateUserBodySchema', () => {
  const valid = {
    name: 'John',
    cpfCnpj: '52998224725',
    email: 'john@example.com',
    phone: '+5585999999999',
    type: UserTypeEnum.MASTER,
  };

  it('should accept valid body', () => {
    assert.equal(updateUserBodySchema.safeParse(valid).success, true);
  });

  it('should reject empty name', () => {
    assert.equal(updateUserBodySchema.safeParse({ ...valid, name: '' }).success, false);
  });
});
