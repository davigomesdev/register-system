import assert from 'node:assert/strict';
import { describe, it, before, after, mock } from 'node:test';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';
import { UserEntity } from '#src/modules/user/domain/user-entity.js';
import { UserSearchResult, UserSearchParams } from '#src/modules/user/domain/user-repository.js';

import {
  buildTestApp,
  createMockJwtService,
  createMockEnvService,
  createMockPersistenceService,
  createMockHashProvider,
  createMockAuditLogProvider,
  authHeader,
} from '../helpers/build-test-app.js';

describe('E2E /api/v1/users', () => {
  const user = new UserEntity({
    name: 'John',
    cpfCnpj: '52998224725',
    email: 'john@example.com',
    phone: '+5585999999999',
    passwordHash: 'hash',
    type: UserTypeEnum.MASTER,
    status: UserStatusEnum.ACTIVE,
  });

  const userRepository = {
    get: mock.fn(async () => user),
    getByEmail: mock.fn(async () => user),
    search: mock.fn(
      async () =>
        new UserSearchResult([user], 1, new UserSearchParams({ filter: { search: null, type: null, status: null }, options: {} })),
    ),
    createTx: mock.fn(async () => undefined),
    updateTx: mock.fn(async () => undefined),
    updateStatusTx: mock.fn(async () => undefined),
    updatePasswordHashTx: mock.fn(async () => undefined),
  };

  const deps = {
    jwtService: createMockJwtService({ subject: user.id, accessLevel: UserTypeEnum.MASTER }),
    envService: createMockEnvService(),
    persistenceService: createMockPersistenceService(),
    hashProvider: createMockHashProvider(),
    auditLogProvider: createMockAuditLogProvider(),
    userRepository: userRepository as never,
    sessionRepository: {} as never,
    customerRepository: {} as never,
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

  it('GET /users without auth should return 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/users' });
    assert.equal(res.statusCode, 401);
  });

  it('GET /users should search users', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/users',
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { data: unknown[]; meta: { total: number } };
    assert.equal(body.meta.total, 1);
  });

  it('GET /users/:id should return user', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/users/${user.id}`,
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { data: { email: string } };
    assert.equal(body.data.email, 'john@example.com');
  });

  it('GET /users/me should return current user', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/users/me',
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { data: { id: string } };
    assert.equal(body.data.id, user.id.toString());
  });

  it('POST /users should create user (MASTER)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/users',
      headers: authHeader(),
      payload: {
        name: 'Jane',
        cpfCnpj: '52998224725',
        email: 'jane@example.com',
        phone: '+5585988888888',
        password: 'password1',
        type: UserTypeEnum.MODERATOR,
      },
    });
    assert.equal(res.statusCode, 201);
    const body = res.json() as { data: { email: string } };
    assert.equal(body.data.email, 'jane@example.com');
  });

  it('POST /users with invalid body should return 422', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/users',
      headers: authHeader(),
      payload: { name: '', email: 'bad', password: '1' },
    });
    assert.equal(res.statusCode, 422);
  });

  it('PUT /users/:id should update user', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/users/${user.id}`,
      headers: authHeader(),
      payload: {
        name: 'John Updated',
        cpfCnpj: '52998224725',
        email: 'john@example.com',
        phone: '+5585999999999',
        type: UserTypeEnum.MASTER,
      },
    });
    assert.equal(res.statusCode, 200);
  });

  it('PATCH /users/:id/status should update status', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/users/${user.id}/status`,
      headers: authHeader(),
      payload: { status: UserStatusEnum.INACTIVE },
    });
    assert.equal(res.statusCode, 200);
  });
});
