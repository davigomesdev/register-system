import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { searchInputAuditLogSchema } from '../search-audit-log-dto.js';

describe('searchInputAuditLogSchema', () => {
  it('should accept empty query', () => {
    assert.equal(searchInputAuditLogSchema.safeParse({}).success, true);
  });

  it('should accept pagination and filters', () => {
    assert.equal(
      searchInputAuditLogSchema.safeParse({
        page: '1',
        perPage: '15',
        actorId: '1',
        resourceId: '2',
        action: 'CREATE',
        resource: 'USER',
        actor: 'true',
      }).success,
      true,
    );
  });
});
