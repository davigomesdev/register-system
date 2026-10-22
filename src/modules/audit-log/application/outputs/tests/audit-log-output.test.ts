import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { AuditLogEntity } from '../../../domain/audit-log-entity.js';
import { AuditLogOutputMapper } from '../audit-log-output.js';

describe('AuditLogOutputMapper', () => {
  it('should map entity to output', () => {
    const auditLog = new AuditLogEntity({
      actorId: 1n,
      resourceId: 2n,
      actorType: ActorTypeEnum.USER,
      action: AuditLogActionEnum.CREATE,
      resource: AuditLogResourceEnum.USER,
      before: null,
      after: { name: 'John' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla',
      metadata: { key: 'value' },
    });

    const output = AuditLogOutputMapper.toOutput(auditLog);

    assert.equal(output.id, auditLog.id.toString());
    assert.equal(output.actorId, '1');
    assert.equal(output.resourceId, '2');
    assert.equal(output.actorType, ActorTypeEnum.USER);
    assert.equal(output.action, AuditLogActionEnum.CREATE);
    assert.equal(output.resource, AuditLogResourceEnum.USER);
    assert.equal(output.before, null);
    assert.deepEqual(output.after, { name: 'John' });
    assert.equal(output.ipAddress, '127.0.0.1');
    assert.equal(output.userAgent, 'Mozilla');
    assert.deepEqual(output.metadata, { key: 'value' });
    assert.ok(output.createdAt instanceof Date);
  });
});
