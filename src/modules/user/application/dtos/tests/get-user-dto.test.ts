import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getUserParamsSchema } from '../get-user-dto.js';

describe('getUserParamsSchema', () => {
  it('should coerce id to bigint', () => {
    const result = getUserParamsSchema.safeParse({ id: '123' });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.id, 123n);
    }
  });

  it('should reject invalid id', () => {
    assert.equal(getUserParamsSchema.safeParse({ id: 'abc' }).success, false);
  });
});
