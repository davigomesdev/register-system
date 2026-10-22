import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { CustomerEntity } from '../../../domain/customer-entity.js';
import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { DeleteCustomerUsecase } from '../delete-customer-usecase.js';

describe('DeleteCustomerUsecase', () => {
  it('should soft delete customer and write audit log', async () => {
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
      softDeleteTx: mock.fn(),
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

    const usecase = new DeleteCustomerUsecase(persistenceService as never, auditLogProvider as never, customerRepository as never);
    await usecase.execute(ctx as never, { id: customer.id });

    assert.equal(customerRepository.softDeleteTx.mock.callCount(), 1);
    assert.equal(auditLogProvider.logTx.mock.callCount(), 1);
    const logArg = auditLogProvider.logTx.mock.calls[0]?.arguments[2] as { action: string; resource: string };
    assert.equal(logArg.action, AuditLogActionEnum.DELETE);
    assert.equal(logArg.resource, AuditLogResourceEnum.CUSTOMER);
    assert.ok(customer.deletedAt instanceof Date);
  });
});
