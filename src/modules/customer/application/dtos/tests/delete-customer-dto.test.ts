import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { deleteCustomerParamsSchema } from '../delete-customer-dto.js';

describe('deleteCustomerParamsSchema', () => {
  it('should coerce id to bigint', () => {
    const result = deleteCustomerParamsSchema.safeParse({ id: '123' });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.id, 123n);
    }
  });

  it('should reject invalid id', () => {
    assert.equal(deleteCustomerParamsSchema.safeParse({ id: 'abc' }).success, false);
  });
});
