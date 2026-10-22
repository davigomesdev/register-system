import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { searchCustomerSchema } from '../search-customer-dto.js';

describe('searchCustomerSchema', () => {
  it('should accept empty query', () => {
    assert.equal(searchCustomerSchema.safeParse({}).success, true);
  });

  it('should accept pagination and search', () => {
    assert.equal(
      searchCustomerSchema.safeParse({
        page: '1',
        perPage: '15',
        search: 'john',
      }).success,
      true,
    );
  });
});
