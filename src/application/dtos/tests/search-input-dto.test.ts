import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { z } from 'zod';

import { createSearchSchema } from '../search-input-dto.js';
import { SortDirection } from '#src/domain/repositories/searchable-repository.js';

describe('createSearchSchema', () => {
  const schema = createSearchSchema(
    z.enum(['name', 'createdAt']),
    z.object({ search: z.string().nullable().optional() }),
    z.object({}),
  );

  it('should accept empty query', () => {
    const result = schema.safeParse({});
    assert.equal(result.success, true);
  });

  it('should coerce page and perPage', () => {
    const result = schema.safeParse({ page: '2', perPage: '10', sort: 'name', sortDir: SortDirection.Asc });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.page, 2);
      assert.equal(result.data.perPage, 10);
      assert.equal(result.data.sort, 'name');
    }
  });

  it('should reject perPage above 50', () => {
    assert.equal(schema.safeParse({ perPage: '51' }).success, false);
  });
});
