import assert from 'node:assert/strict';
import { describe, it, before, after, mock } from 'node:test';

import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { AuditLogActionEnum } from '#src/domain/enums/audit-log-action-enum.js';
import { AuditLogResourceEnum } from '#src/domain/enums/audit-log-resource-enum.js';
import { AuditLogEntity } from '#src/modules/audit-log/domain/audit-log-entity.js';
import { AuditLogSearchResult, AuditLogSearchParams } from '#src/modules/audit-log/domain/audit-log-repository.js';

import {
  buildTestApp,
  createMockJwtService,
  createMockEnvService,
  createMockPersistenceService,
  createMockHashProvider,
  createMockAuditLogProvider,
  authHeader,
} from '../helpers/build-test-app.js';

describe('E2E /api/v1/audit-logs', () => {
  const auditLog = new AuditLogEntity({
    actorId: 1n,
    resourceId: 2n,
    actorType: ActorTypeEnum.USER,
    action: AuditLogActionEnum.CREATE,
    resource: AuditLogResourceEnum.USER,
    after: { name: 'John' },
  });

  const auditLogRepository = {
    get: mock.fn(async () => auditLog),
    search: mock.fn(async () => new AuditLogSearchResult([auditLog], 1, new AuditLogSearchParams({ filter: {}, options: {} }))),
  };

  const deps = {
    jwtService: createMockJwtService({ accessLevel: UserTypeEnum.MASTER }),
    envService: createMockEnvService(),
    persistenceService: createMockPersistenceService(),
    hashProvider: createMockHashProvider(),
    auditLogProvider: createMockAuditLogProvider(),
    userRepository: {} as never,
    sessionRepository: {} as never,
    customerRepository: {} as never,
    productRepository: {} as never,
    auditLogRepository: auditLogRepository as never,
  };

  let app: Awaited<ReturnType<typeof buildTestApp>>;

  before(async () => {
    app = await buildTestApp(deps);
  });

  after(async () => {
    await app?.close();
  });

  it('GET /audit-logs without auth should return 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/audit-logs' });
    assert.equal(res.statusCode, 401);
  });

  it('GET /audit-logs should search', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/audit-logs',
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { data: unknown[]; meta: { total: number } };
    assert.equal(body.meta.total, 1);
  });

  it('GET /audit-logs/:id should return audit log', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/audit-logs/${auditLog.id}`,
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as { data: { action: string; resource: string } };
    assert.equal(body.data.action, AuditLogActionEnum.CREATE);
    assert.equal(body.data.resource, AuditLogResourceEnum.USER);
  });

  it('GET /audit-logs with MODERATOR access should work', async () => {
    const modApp = await buildTestApp({
      ...deps,
      jwtService: createMockJwtService({ accessLevel: UserTypeEnum.MODERATOR }),
    });
    const res = await modApp.inject({
      method: 'GET',
      url: '/api/v1/audit-logs',
      headers: authHeader(),
    });
    assert.equal(res.statusCode, 200);
    await modApp.close();
  });
});
