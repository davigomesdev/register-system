import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { CustomerEntity } from '../../../domain/customer-entity.js';
import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { UpdateCustomerUsecase } from '../update-customer-usecase.js';

describe('UpdateCustomerUsecase', () => {
  it('should update customer and write audit log', async () => {
    const customer = new CustomerEntity({
      name: 'John',
      cpfCnpj: '12345678909',
      email: 'john@example.com',
      phone: '85999999999',
    });

    const persistenceService = {
      begin: mock.fn(async (fn: (tx: unknown) => Promise<void>) => fn({})),
    };
    const auditLogProvider = { logTx: mock.fn() };
    const customerRepository = {
      get: mock.fn(async () => customer),
      updateTx: mock.fn(),
    };
    const ctx = {
      requestId: null,
      actorId: 1n,
      actorType: ActorTypeEnum.USER,
      ip: null,
      userAgent: null,
      deviceInfo: null,
      log: console,
    };

    const usecase = new UpdateCustomerUsecase(persistenceService as never, auditLogProvider as never, customerRepository as never);
    const output = await usecase.execute(ctx as never, {
      id: customer.id,
      name: 'Jane',
      cpfCnpj: '12345678909',
      email: 'jane@example.com',
      phone: '85988888888',
    });

    assert.equal(customerRepository.updateTx.mock.callCount(), 1);
    assert.equal(auditLogProvider.logTx.mock.callCount(), 1);
    const logArg = auditLogProvider.logTx.mock.calls[0]?.arguments[2] as { action: string; resource: string };
    assert.equal(logArg.action, AuditLogActionEnum.UPDATE);
    assert.equal(logArg.resource, AuditLogResourceEnum.CUSTOMER);
    assert.equal(output.name, 'Jane');
  });
});
