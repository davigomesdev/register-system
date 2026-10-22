import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getCustomerParamsSchema } from '../get-customer-dto.js';

describe('getCustomerParamsSchema', () => {
  it('should coerce id to bigint', () => {
    const result = getCustomerParamsSchema.safeParse({ id: '123' });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.id, 123n);
    }
  });

  it('should reject invalid id', () => {
    assert.equal(getCustomerParamsSchema.safeParse({ id: 'abc' }).success, false);
  });
});
