import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';

import {
  buildTestApp,
  createMockJwtService,
  createMockEnvService,
  createMockPersistenceService,
  createMockHashProvider,
  createMockAuditLogProvider,
} from '../helpers/build-test-app.js';

describe('E2E /health', () => {
  const deps = {
    jwtService: createMockJwtService(),
    envService: createMockEnvService(),
    persistenceService: createMockPersistenceService(),
    hashProvider: createMockHashProvider(),
    auditLogProvider: createMockAuditLogProvider(),
    userRepository: {} as never,
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

  it('GET /health should return ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.json(), { status: 'ok' });
  });

  it('unknown route should return 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/unknown' });
    assert.equal(res.statusCode, 404);
    const body = res.json() as { error: { code: number } };
    assert.equal(body.error.code, 404);
  });
});
