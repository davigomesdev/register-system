import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createSessionSchema } from '../create-session-dto.js';

describe('createSessionSchema', () => {
  const valid = {
    email: 'john@example.com',
    password: 'password1',
  };

  it('should accept valid input', () => {
    assert.equal(createSessionSchema.safeParse(valid).success, true);
  });

  it('should reject invalid email', () => {
    assert.equal(createSessionSchema.safeParse({ ...valid, email: 'not-email' }).success, false);
  });

  it('should reject empty password', () => {
    assert.equal(createSessionSchema.safeParse({ ...valid, password: '' }).success, false);
  });
});
