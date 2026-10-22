import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SessionEntity } from '../../../domain/session-entity.js';
import { SessionOutputMapper } from '../session-output.js';

describe('SessionOutputMapper', () => {
  it('should map entity to output', () => {
    const session = new SessionEntity({
      userId: 1n,
      refreshTokenHash: 'hash',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla',
      deviceInfo: 'device',
    });

    const output = SessionOutputMapper.toOutput(session);

    assert.equal(output.id, session.id.toString());
    assert.equal(output.userId, '1');
    assert.equal(output.familyId, session.familyId.toString());
    assert.equal(output.parentId, null);
    assert.equal(output.ipAddress, '127.0.0.1');
    assert.equal(output.userAgent, 'Mozilla');
    assert.equal(output.deviceInfo, 'device');
    assert.equal(output.revokedAt, null);
    assert.ok(output.expiresAt instanceof Date);
    assert.ok(output.createdAt instanceof Date);
    assert.ok(output.updatedAt instanceof Date);
    assert.equal('refreshTokenHash' in output, false);
  });
});
