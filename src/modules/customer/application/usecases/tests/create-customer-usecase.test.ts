import assert from 'node:assert/strict';
import { describe, it, beforeEach, mock } from 'node:test';

import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';

import { CreateCustomerUsecase } from '../create-customer-usecase.js';

describe('CreateCustomerUsecase', () => {
  const persistenceService = {
    begin: mock.fn(async (fn: (tx: unknown) => Promise<void>) => fn({})),
  };
  const auditLogProvider = {
    logTx: mock.fn(),
  };
  const customerRepository = {
    createTx: mock.fn(),
  };
  const ctx = {
    requestId: 'req-1',
    actorId: 1n,
    actorType: ActorTypeEnum.USER,
    ip: '127.0.0.1',
    userAgent: null,
    deviceInfo: null,
    log: console,
  };

  let usecase: CreateCustomerUsecase;

  beforeEach(() => {
    persistenceService.begin.mock.resetCalls();
    auditLogProvider.logTx.mock.resetCalls();
    customerRepository.createTx.mock.resetCalls();
    usecase = new CreateCustomerUsecase(persistenceService as never, auditLogProvider as never, customerRepository as never);
  });

  it('should create customer and write audit log', async () => {
    const output = await usecase.execute(ctx as never, {
      name: 'John',
      cpfCnpj: '12345678909',
      email: 'john@example.com',
      phone: '85999999999',
    });

    assert.equal(customerRepository.createTx.mock.callCount(), 1);
    assert.equal(auditLogProvider.logTx.mock.callCount(), 1);

    const logArg = auditLogProvider.logTx.mock.calls[0]?.arguments[2] as { action: string; resource: string };
    assert.equal(logArg.action, AuditLogActionEnum.CREATE);
    assert.equal(logArg.resource, AuditLogResourceEnum.CUSTOMER);
    assert.equal(output.email, 'john@example.com');
    assert.equal(output.name, 'John');
  });
});
