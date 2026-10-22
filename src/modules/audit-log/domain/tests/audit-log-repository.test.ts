import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { AuditLogSearchParams, AuditLogSort } from '../audit-log-repository.js';

describe('AuditLogSearchParams', () => {
  it('should use default sort CREATED_AT', () => {
    const params = new AuditLogSearchParams({
      filter: {},
      options: {},
    });
    assert.equal(params.sort, AuditLogSort.CREATED_AT);
    assert.equal(params.page, 1);
  });
});
