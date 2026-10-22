import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { updateMeSchema } from '../update-me-dto.js';

describe('updateMeSchema', () => {
  const valid = {
    name: 'John',
    cpfCnpj: '52998224725',
    email: 'john@example.com',
    phone: '+5585999999999',
  };

  it('should accept valid input', () => {
    assert.equal(updateMeSchema.safeParse(valid).success, true);
  });

  it('should reject invalid email', () => {
    assert.equal(updateMeSchema.safeParse({ ...valid, email: 'x' }).success, false);
  });
});
