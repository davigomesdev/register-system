import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ProductSearchParams, ProductSort } from '../product-repository.js';

describe('ProductSearchParams', () => {
  it('should use default sort CREATED_AT', () => {
    const params = new ProductSearchParams({
      filter: { search: null, gender: null },
      options: {},
    });
    assert.equal(params.sort, ProductSort.CREATED_AT);
    assert.equal(params.page, 1);
  });
});
