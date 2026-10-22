import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { revokeMeSessionParamsSchema } from '../revoke-me-session-dto.js';

describe('revokeMeSessionParamsSchema', () => {
  it('should coerce id to bigint', () => {
    const result = revokeMeSessionParamsSchema.safeParse({ id: '123' });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.id, 123n);
    }
  });

  it('should reject invalid id', () => {
    assert.equal(revokeMeSessionParamsSchema.safeParse({ id: 'abc' }).success, false);
  });
});
