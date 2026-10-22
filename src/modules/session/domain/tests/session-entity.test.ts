import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SessionEntity, REFRESH_TOKEN_EXPIRY_DAYS } from '../session-entity.js';

describe('SessionEntity', () => {
  it('should create with defaults', () => {
    const session = new SessionEntity({
      userId: 1n,
      refreshTokenHash: 'hash',
    });

    assert.equal(session.userId, 1n);
    assert.equal(session.familyId, session.id);
    assert.equal(session.parentId, null);
    assert.equal(session.refreshTokenHash, 'hash');
    assert.equal(session.ipAddress, null);
    assert.equal(session.userAgent, null);
    assert.equal(session.deviceInfo, null);
    assert.equal(session.revokedAt, null);
    assert.ok(session.isActive());
    assert.ok(session.expiresAt.getTime() > Date.now());
  });

  it('should mask refreshTokenHash in toJSON', () => {
    const session = new SessionEntity({
      userId: 1n,
      refreshTokenHash: 'secret-hash',
    });
    const json = session.toJSON();

    assert.equal(json.refreshTokenHash, '********');
  });

  it('should revoke session', () => {
    const session = new SessionEntity({
      userId: 1n,
      refreshTokenHash: 'hash',
    });
    session.revoke();

    assert.ok(session.revokedAt instanceof Date);
    assert.equal(session.isActive(), false);
  });

  it('should create from parent', () => {
    const parent = new SessionEntity({
      userId: 1n,
      refreshTokenHash: 'parent-hash',
      ipAddress: '127.0.0.1',
    });
    const child = SessionEntity.fromParent(parent, 'child-hash');

    assert.equal(child.userId, parent.userId);
    assert.equal(child.familyId, parent.familyId);
    assert.equal(child.parentId, parent.id);
    assert.equal(child.refreshTokenHash, 'child-hash');
    assert.equal(child.ipAddress, '127.0.0.1');
  });

  it('should use REFRESH_TOKEN_EXPIRY_DAYS', () => {
    assert.equal(REFRESH_TOKEN_EXPIRY_DAYS, 7);
  });
});
