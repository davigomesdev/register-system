import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CustomerSearchParams, CustomerSort } from '../customer-repository.js';

describe('CustomerSearchParams', () => {
  it('should use default sort CREATED_AT', () => {
    const params = new CustomerSearchParams({
      filter: { search: null },
      options: {},
    });
    assert.equal(params.sort, CustomerSort.CREATED_AT);
    assert.equal(params.page, 1);
  });
});
