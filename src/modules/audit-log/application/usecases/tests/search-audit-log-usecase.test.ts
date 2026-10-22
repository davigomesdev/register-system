import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { SearchAuditLogUsecase } from '../search-audit-log-usecase.js';

describe('SearchAuditLogUsecase', () => {
  it('should search audit logs', async () => {
    const result = { items: [], total: 0, page: 1, perPage: 15, lastPage: () => 1 };
    const auditLogRepository = {
      search: mock.fn(async () => result),
    };

    const usecase = new SearchAuditLogUsecase(auditLogRepository as never);
    const output = await usecase.execute({ filter: {}, options: {} } as never);

    assert.equal(auditLogRepository.search.mock.callCount(), 1);
    assert.equal(output.total, 0);
  });
});
