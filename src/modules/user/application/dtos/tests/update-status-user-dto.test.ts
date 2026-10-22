import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';
import { updateStatusUserBodySchema } from '../update-status-user-dto.js';

describe('updateStatusUserBodySchema', () => {
  it('should accept ACTIVE', () => {
    assert.equal(updateStatusUserBodySchema.safeParse({ status: UserStatusEnum.ACTIVE }).success, true);
  });

  it('should reject invalid status', () => {
    assert.equal(updateStatusUserBodySchema.safeParse({ status: 'UNKNOWN' }).success, false);
  });
});
