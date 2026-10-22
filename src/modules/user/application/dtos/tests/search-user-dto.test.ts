import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { searchUserSchema } from '../search-user-dto.js';

describe('searchUserSchema', () => {
  it('should accept empty query', () => {
    assert.equal(searchUserSchema.safeParse({}).success, true);
  });

  it('should accept pagination and search', () => {
    assert.equal(
      searchUserSchema.safeParse({
        page: '1',
        perPage: '15',
        search: 'john',
      }).success,
      true,
    );
  });
});
