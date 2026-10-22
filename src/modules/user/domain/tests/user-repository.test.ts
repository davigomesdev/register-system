import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { UserSort, USER_SORT_COLUMN, UserSearchParams } from '../user-repository.js';

describe('UserRepository helpers', () => {
  it('should map sort columns', () => {
    assert.equal(USER_SORT_COLUMN[UserSort.NAME], 'name');
    assert.equal(USER_SORT_COLUMN[UserSort.EMAIL], 'email');
    assert.equal(USER_SORT_COLUMN[UserSort.CREATED_AT], 'created_at');
  });

  it('should default sort to CREATED_AT', () => {
    const params = new UserSearchParams({
      filter: { search: null, type: null, status: null },
      options: {},
    });
    assert.equal(params.sort, UserSort.CREATED_AT);
    assert.equal(params.page, 1);
  });
});
