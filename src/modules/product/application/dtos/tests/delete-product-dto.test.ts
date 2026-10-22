import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { deleteProductParamsSchema } from '../delete-product-dto.js';

describe('deleteProductParamsSchema', () => {
  it('should coerce id to bigint', () => {
    const result = deleteProductParamsSchema.safeParse({ id: '123' });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.id, 123n);
    }
  });

  it('should reject invalid id', () => {
    assert.equal(deleteProductParamsSchema.safeParse({ id: 'abc' }).success, false);
  });
});
