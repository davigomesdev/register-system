import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { updateMePasswordSchema } from '../update-me-password-dto.js';

describe('updateMePasswordSchema', () => {
  it('should accept valid passwords', () => {
    assert.equal(
      updateMePasswordSchema.safeParse({
        oldPassword: 'password1',
        newPassword: 'password2',
      }).success,
      true,
    );
  });

  it('should reject short passwords', () => {
    assert.equal(
      updateMePasswordSchema.safeParse({
        oldPassword: '123',
        newPassword: 'password2',
      }).success,
      false,
    );
  });
});
