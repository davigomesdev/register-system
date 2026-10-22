import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SessionModel } from '../session-model.js';

describe('SessionModel', () => {
  it('should map row to entity', () => {
    const entity = SessionModel.toEntity({
      id: '10',
      user_id: '1',
      family_id: '10',
      parent_id: null,
      refresh_token_hash: 'hash',
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla',
      device_info: 'device',
      last_used_at: new Date('2026-01-01'),
      revoked_at: null,
      expires_at: new Date('2026-01-08'),
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-02'),
    });

    assert.equal(entity.id, 10n);
    assert.equal(entity.userId, 1n);
    assert.equal(entity.familyId, 10n);
    assert.equal(entity.parentId, null);
    assert.equal(entity.refreshTokenHash, 'hash');
    assert.equal(entity.ipAddress, '127.0.0.1');
    assert.equal(entity.userAgent, 'Mozilla');
    assert.equal(entity.deviceInfo, 'device');
    assert.equal(entity.revokedAt, null);
    assert.ok(entity.expiresAt instanceof Date);
  });

  it('should map parent_id when present', () => {
    const entity = SessionModel.toEntity({
      id: '11',
      user_id: '1',
      family_id: '10',
      parent_id: '10',
      refresh_token_hash: 'child-hash',
      ip_address: null,
      user_agent: null,
      device_info: null,
      last_used_at: new Date('2026-01-01'),
      revoked_at: new Date('2026-01-03'),
      expires_at: new Date('2026-01-08'),
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-03'),
    });

    assert.equal(entity.parentId, 10n);
    assert.equal(entity.ipAddress, null);
    assert.equal(entity.userAgent, null);
    assert.equal(entity.deviceInfo, null);
    assert.ok(entity.revokedAt instanceof Date);
  });
});
