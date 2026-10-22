import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getProductParamsSchema } from '../get-product-dto.js';

describe('getProductParamsSchema', () => {
  it('should coerce id to bigint', () => {
    const result = getProductParamsSchema.safeParse({ id: '123' });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.id, 123n);
    }
  });

  it('should reject invalid id', () => {
    assert.equal(getProductParamsSchema.safeParse({ id: 'abc' }).success, false);
  });
});
