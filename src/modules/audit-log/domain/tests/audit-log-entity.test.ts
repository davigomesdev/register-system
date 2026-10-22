import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { AuditLogEntity } from '../audit-log-entity.js';

describe('AuditLogEntity', () => {
  it('should create with defaults', () => {
    const auditLog = new AuditLogEntity({
      actorType: ActorTypeEnum.USER,
      action: AuditLogActionEnum.CREATE,
      resource: AuditLogResourceEnum.USER,
    });

    assert.equal(auditLog.actorId, null);
    assert.equal(auditLog.resourceId, null);
    assert.equal(auditLog.actorType, ActorTypeEnum.USER);
    assert.equal(auditLog.action, AuditLogActionEnum.CREATE);
    assert.equal(auditLog.resource, AuditLogResourceEnum.USER);
    assert.equal(auditLog.before, null);
    assert.equal(auditLog.after, null);
    assert.equal(auditLog.ipAddress, null);
    assert.equal(auditLog.userAgent, null);
    assert.equal(auditLog.metadata, null);
    assert.ok(auditLog.id);
    assert.ok(auditLog.createdAt instanceof Date);
  });

  it('should accept all props', () => {
    const auditLog = new AuditLogEntity({
      actorId: 1n,
      resourceId: 2n,
      actorType: ActorTypeEnum.SYSTEM,
      action: AuditLogActionEnum.UPDATE,
      resource: AuditLogResourceEnum.CUSTOMER,
      before: { a: 1 },
      after: { a: 2 },
      ipAddress: '127.0.0.1',
      userAgent: 'ua',
      metadata: { reason: 'test' },
    });

    assert.equal(auditLog.actorId, 1n);
    assert.equal(auditLog.resourceId, 2n);
    assert.equal(auditLog.actorType, ActorTypeEnum.SYSTEM);
    assert.deepEqual(auditLog.before, { a: 1 });
    assert.deepEqual(auditLog.after, { a: 2 });
    assert.equal(auditLog.ipAddress, '127.0.0.1');
    assert.deepEqual(auditLog.metadata, { reason: 'test' });
  });
});
