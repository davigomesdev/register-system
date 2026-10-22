import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { AuditLogEntity } from '../../../domain/audit-log-entity.js';
import { GetAuditLogUsecase } from '../get-audit-log-usecase.js';

describe('GetAuditLogUsecase', () => {
  it('should return audit log by id', async () => {
    const auditLog = new AuditLogEntity({
      actorType: ActorTypeEnum.USER,
      action: AuditLogActionEnum.CREATE,
      resource: AuditLogResourceEnum.PRODUCT,
    });
    const auditLogRepository = {
      get: mock.fn(async () => auditLog),
    };

    const usecase = new GetAuditLogUsecase(auditLogRepository as never);
    const output = await usecase.execute({ id: auditLog.id });

    assert.equal(auditLogRepository.get.mock.callCount(), 1);
    assert.ok(output);
  });
});
