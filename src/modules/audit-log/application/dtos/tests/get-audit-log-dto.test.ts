import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getAuditLogParamsSchema, getAuditLogQuerySchema } from '../get-audit-log-dto.js';

describe('getAuditLogParamsSchema', () => {
  it('should coerce id to bigint', () => {
    const result = getAuditLogParamsSchema.safeParse({ id: '123' });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.id, 123n);
    }
  });

  it('should reject invalid id', () => {
    assert.equal(getAuditLogParamsSchema.safeParse({ id: 'abc' }).success, false);
  });
});

describe('getAuditLogQuerySchema', () => {
  it('should accept actor true', () => {
    const result = getAuditLogQuerySchema.safeParse({ actor: 'true' });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.actor, true);
    }
  });

  it('should accept empty query', () => {
    assert.equal(getAuditLogQuerySchema.safeParse({}).success, true);
  });
});
