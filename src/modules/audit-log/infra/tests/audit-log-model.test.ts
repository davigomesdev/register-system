import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';
import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';

import { AuditLogModel } from '../audit-log-model.js';

describe('AuditLogModel', () => {
  it('should map row to entity', () => {
    const encryptionService = {
      decrypt: mock.fn((v: string) => `decrypted:${v}`),
      encrypt: mock.fn((v: string) => `encrypted:${v}`),
    };

    const entity = AuditLogModel.toEntity(
      {
        id: '1',
        actor_id: '10',
        resource_id: '20',
        actor_type: ActorTypeEnum.USER,
        action: AuditLogActionEnum.CREATE,
        resource: AuditLogResourceEnum.USER,
        before: null,
        after: { name: 'John' },
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla',
        metadata: { key: 'value' },
        created_at: new Date('2026-01-01'),
      },
      encryptionService as never,
    );

    assert.equal(entity.id, 1n);
    assert.equal(entity.actorId, 10n);
    assert.equal(entity.resourceId, 20n);
    assert.equal(entity.actorType, ActorTypeEnum.USER);
    assert.equal(entity.action, AuditLogActionEnum.CREATE);
    assert.equal(entity.resource, AuditLogResourceEnum.USER);
    assert.equal(entity.before, null);
    assert.deepEqual(entity.after, { name: 'John' });
    assert.equal(entity.ipAddress, '127.0.0.1');
    assert.equal(entity.userAgent, 'Mozilla');
    assert.deepEqual(entity.metadata, { key: 'value' });
    assert.equal(entity.actor, null);
  });

  it('should map null actor_id and resource_id', () => {
    const encryptionService = {
      decrypt: mock.fn((v: string) => v),
      encrypt: mock.fn((v: string) => v),
    };

    const entity = AuditLogModel.toEntity(
      {
        id: '2',
        actor_id: null,
        resource_id: null,
        actor_type: ActorTypeEnum.SYSTEM,
        action: AuditLogActionEnum.OTHER,
        resource: AuditLogResourceEnum.SESSION,
        before: null,
        after: null,
        ip_address: null,
        user_agent: null,
        metadata: null,
        created_at: new Date('2026-01-01'),
      },
      encryptionService as never,
    );

    assert.equal(entity.actorId, null);
    assert.equal(entity.resourceId, null);
    assert.equal(entity.actorType, ActorTypeEnum.SYSTEM);
    assert.equal(entity.actor, null);
  });

  it('should map nested actor when present', () => {
    const encryptionService = {
      decrypt: mock.fn((v: string) => `decrypted:${v}`),
      encrypt: mock.fn((v: string) => `encrypted:${v}`),
    };

    const entity = AuditLogModel.toEntity(
      {
        id: '3',
        actor_id: '1',
        resource_id: null,
        actor_type: ActorTypeEnum.USER,
        action: AuditLogActionEnum.UPDATE,
        resource: AuditLogResourceEnum.CUSTOMER,
        before: { a: 1 },
        after: { a: 2 },
        ip_address: null,
        user_agent: null,
        metadata: null,
        created_at: new Date('2026-01-01'),
        actor: {
          id: '1',
          name: 'John',
          enc_cpf_cnpj: 'enc-cpf',
          email: 'john@example.com',
          phone: '85999999999',
          password_hash: 'hash',
          type: UserTypeEnum.MASTER,
          status: UserStatusEnum.ACTIVE,
          created_at: new Date('2026-01-01'),
          updated_at: new Date('2026-01-02'),
        },
      },
      encryptionService as never,
    );

    assert.ok(entity.actor);
    assert.equal(entity.actor!.id, 1n);
    assert.equal(entity.actor!.name, 'John');
    assert.equal(entity.actor!.cpfCnpj, 'decrypted:enc-cpf');
    assert.equal(encryptionService.decrypt.mock.callCount(), 1);
  });
});
