import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getMeSessionParamsSchema } from '../get-me-session-dto.js';

describe('getMeSessionParamsSchema', () => {
  it('should coerce id to bigint', () => {
    const result = getMeSessionParamsSchema.safeParse({ id: '123' });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.id, 123n);
    }
  });

  it('should reject invalid id', () => {
    assert.equal(getMeSessionParamsSchema.safeParse({ id: 'abc' }).success, false);
  });
});
