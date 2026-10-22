import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SessionSearchParams, SessionSort } from '../session-repository.js';

describe('SessionSearchParams', () => {
  it('should use default sort CREATED_AT', () => {
    const params = new SessionSearchParams({
      filter: {},
      options: {},
    });
    assert.equal(params.sort, SessionSort.CREATED_AT);
    assert.equal(params.page, 1);
  });
});
