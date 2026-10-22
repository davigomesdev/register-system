import assert from 'node:assert/strict';
import { describe, it, before, after, mock } from 'node:test';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';
import { UserEntity } from '#src/modules/user/domain/user-entity.js';
import { SessionEntity } from '#src/modules/session/domain/session-entity.js';
import { SessionSearchResult, SessionSearchParams } from '#src/modules/session/domain/session-repository.js';
import { UnauthorizedError } from '#src/domain/errors/unauthorized-error.js';

import {
  buildTestApp,
  createMockJwtService,
  createMockEnvService,
  createMockPersistenceService,
  createMockHashProvider,
  createMockAuditLogProvider,
  authHeader,
} from '../helpers/build-test-app.js';

describe('E2E /api/v1/sessions', () => {
  const user = new UserEntity({
    name: 'John',
    cpfCnpj: '52998224725',
    email: 'john@example.com',
    phone: '+5585999999999',
    passwordHash: 'hash',
    type: UserTypeEnum.MASTER,
    status: UserStatusEnum.ACTIVE,
  });

  const session = new SessionEntity({
    userId: user.id,
    refreshTokenHash: 'hashed-token',
  });

  const userRepository = {
    getByEmail: mock.fn(async (email: string) => {
      if (email === user.email) return user;
      throw new UnauthorizedError();
    }),
    get: mock.fn(async () => user),
  };

  const sessionRepository = {
    createTx: mock.fn(async () => undefined),
    getByIdAndUserId: mock.fn(async () => session),
    getByRefreshTokenHash: mock.fn(async () => session),
    search: mock.fn(
      async () => new SessionSearchResult([session], 1, new SessionSearchParams({ filter: {}, options: {} })),
    ),
    revokeTx: mock.fn(async () => undefined),
    revokeAllByUserIdTx: mock.fn(async () => undefined),
    updateTx: mock.fn(async () => undefined),
    revokeByFamilyIdTx: mock.fn(async () => undefined),
  };

  const deps = {
    jwtService: createMockJwtService({ subject: user.id, accessLevel: UserTypeEnum.MASTER }),
    envService: createMockEnvService(),
    persistenceService: createMockPersistenceService(),
    hashProvider: createMockHashProvider(),
    auditLogProvider: createMockAuditLogProvider(),
    userRepository: userRepository as never,
    sessionRepository: sessionRepository as never,
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

  it('POST /sessions should login and set refresh cookie', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/sessions',
      payload: { email: 'john@example.com', password: 'password1' },
    });

    assert.equal(res.statusCode, 201);
    const body = res.json() as { data: { accessToken: string } };
    assert.equal(body.data.accessToken, 'test-access-token');
    assert.ok(res.headers['set-cookie']);
  });

  it('POST /sessions with invalid body should return 422', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/sessions',
      payload: { email: 'not-email', password: '' },
    });
    assert.equal(res.statusCode, 422);
  });

  it('POST /sessions/refresh without cookie should return 401', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/v1/sessions/refresh' });
    assert.equal(res.statusCode, 401);
  });

  it('GET /sessions/me should require auth', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/sessions/me' });
    assert.equal(res.statusCode, 401);
  });

  it('GET /sessions/me should list sessions when authenticated', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/sessions/me',
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { data: unknown[]; meta: { total: number } };
    assert.equal(body.meta.total, 1);
    assert.equal(body.data.length, 1);
  });

  it('GET /sessions/me/:id should return session', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/sessions/me/${session.id}`,
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { data: { id: string } };
    assert.equal(body.data.id, session.id.toString());
  });

  it('DELETE /sessions/me/:id should revoke session', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/sessions/me/${session.id}`,
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 204);
  });

  it('DELETE /sessions/me should revoke all', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/v1/sessions/me',
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 204);
  });
});
