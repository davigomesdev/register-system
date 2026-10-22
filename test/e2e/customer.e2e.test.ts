import assert from 'node:assert/strict';
import { describe, it, before, after, mock } from 'node:test';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { CustomerEntity } from '#src/modules/customer/domain/customer-entity.js';
import { CustomerSearchResult, CustomerSearchParams } from '#src/modules/customer/domain/customer-repository.js';

import {
  buildTestApp,
  createMockJwtService,
  createMockEnvService,
  createMockPersistenceService,
  createMockHashProvider,
  createMockAuditLogProvider,
  authHeader,
} from '../helpers/build-test-app.js';

describe('E2E /api/v1/customers', () => {
  const customer = new CustomerEntity({
    name: 'Customer',
    cpfCnpj: '52998224725',
    email: 'customer@example.com',
    phone: '+5585999999999',
  });

  const customerRepository = {
    get: mock.fn(async () => customer),
    search: mock.fn(
      async () => new CustomerSearchResult([customer], 1, new CustomerSearchParams({ filter: { search: null }, options: {} })),
    ),
    createTx: mock.fn(async () => undefined),
    updateTx: mock.fn(async () => undefined),
    softDeleteTx: mock.fn(async () => undefined),
  };

  const deps = {
    jwtService: createMockJwtService({ accessLevel: UserTypeEnum.MASTER }),
    envService: createMockEnvService(),
    persistenceService: createMockPersistenceService(),
    hashProvider: createMockHashProvider(),
    auditLogProvider: createMockAuditLogProvider(),
    userRepository: {} as never,
    sessionRepository: {} as never,
    customerRepository: customerRepository as never,
    productRepository: {} as never,
    auditLogRepository: {} as never,
  };

  let app: Awaited<ReturnType<typeof buildTestApp>>;

  before(async () => {
    app = await buildTestApp(deps);
  });

  after(async () => {
    await app?.close();
  });

  it('GET /customers without auth should return 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/customers' });
    assert.equal(res.statusCode, 401);
  });

  it('GET /customers should search', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/customers?search=Customer',
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { data: unknown[]; meta: { total: number } };
    assert.equal(body.meta.total, 1);
  });

  it('GET /customers/:id should return customer', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/customers/${customer.id}`,
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { data: { name: string } };
    assert.equal(body.data.name, 'Customer');
  });

  it('POST /customers should create', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/customers',
      headers: authHeader(),
      payload: {
        name: 'New Customer',
        email: 'new@example.com',
      },
    });
    assert.equal(res.statusCode, 201);
    const body = res.json() as { data: { name: string } };
    assert.equal(body.data.name, 'New Customer');
  });

  it('POST /customers with invalid body should return 422', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/customers',
      headers: authHeader(),
      payload: { name: '' },
    });
    assert.equal(res.statusCode, 422);
  });

  it('PUT /customers/:id should update', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/customers/${customer.id}`,
      headers: authHeader(),
      payload: {
        name: 'Updated',
        email: 'updated@example.com',
      },
    });
    assert.equal(res.statusCode, 200);
  });

  it('DELETE /customers/:id should soft delete', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/customers/${customer.id}`,
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 204);
  });
});
