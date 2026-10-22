import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { searchMeSessionSchema } from '../search-me-session-dto.js';

describe('searchMeSessionSchema', () => {
  it('should accept empty query', () => {
    assert.equal(searchMeSessionSchema.safeParse({}).success, true);
  });

  it('should accept pagination and filters', () => {
    assert.equal(
      searchMeSessionSchema.safeParse({
        page: '1',
        perPage: '15',
        familyId: '123',
        activeOnly: 'true',
      }).success,
      true,
    );
  });
});
