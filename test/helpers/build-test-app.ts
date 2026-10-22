import type { FastifyInstance } from 'fastify';
import type { IJwtService, JwtClaims } from '#src/infra/jwt/jwt-service.js';
import type { IEnvService } from '#src/infra/env/env-service.js';
import type { HashProvider } from '#src/application/providers/hash-provider.js';
import type { AuditLogProvider } from '#src/modules/audit-log/application/providers/audit-log-provider.js';
import type { IPersistenceService } from '#src/infra/persistence/persistence-service.js';
import type { UserRepository } from '#src/modules/user/domain/user-repository.js';
import type { SessionRepository } from '#src/modules/session/domain/session-repository.js';
import type { CustomerRepository } from '#src/modules/customer/domain/customer-repository.js';
import type { ProductRepository } from '#src/modules/product/domain/product-repository.js';
import type { AuditLogRepository } from '#src/modules/audit-log/domain/audit-log-repository.js';

import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { ErrorFilter } from '#src/adapters/interceptors/error-filter.js';
import { UserRoutes } from '#src/modules/user/adapters/user-router.js';
import { SessionRoutes } from '#src/modules/session/adapters/session-router.js';
import { ProductRoutes } from '#src/modules/product/adapters/product-router.js';
import { CustomerRoutes } from '#src/modules/customer/adapters/customer-router.js';
import { AuditLogRoutes } from '#src/modules/audit-log/adapters/audit-log-router.js';

import { SubjectTypeEnum } from '#src/domain/enums/subject-type-enum.js';
import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';

export type TestDeps = {
  jwtService: IJwtService;
  envService: IEnvService;
  persistenceService: IPersistenceService;
  hashProvider: HashProvider;
  auditLogProvider: AuditLogProvider;
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  customerRepository: CustomerRepository;
  productRepository: ProductRepository;
  auditLogRepository: AuditLogRepository;
};

/** Builds a Fastify app wired like production, without listen / redis rate-limit / real DB. */
export async function buildTestApp(deps: TestDeps): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false,
    trustProxy: true,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(ErrorFilter.handle);
  app.setNotFoundHandler(ErrorFilter.notFound);

  await app.register(cookie);

  app.get('/health', async () => ({ status: 'ok' }));

  app.register(
    async (api: FastifyInstance): Promise<void> => {
      UserRoutes.register(api, deps.jwtService, deps.persistenceService, deps.hashProvider, deps.auditLogProvider, deps.userRepository);
      SessionRoutes.register(
        api,
        deps.envService,
        deps.jwtService,
        deps.persistenceService,
        deps.hashProvider,
        deps.auditLogProvider,
        deps.userRepository,
        deps.sessionRepository,
      );
      ProductRoutes.register(api, deps.jwtService, deps.persistenceService, deps.auditLogProvider, deps.productRepository);
      CustomerRoutes.register(api, deps.jwtService, deps.persistenceService, deps.auditLogProvider, deps.customerRepository);
      AuditLogRoutes.register(api, deps.jwtService, deps.auditLogRepository);
    },
    { prefix: '/api/v1' },
  );

  await app.ready();
  return app;
}

export function createMockJwtService(defaultClaims?: Partial<JwtClaims>): IJwtService {
  const claims: JwtClaims = {
    subject: 1n,
    issuer: SubjectTypeEnum.USER,
    accessLevel: UserTypeEnum.MASTER,
    expiresAt: Math.floor(Date.now() / 1000) + 900,
    issuedAt: Math.floor(Date.now() / 1000),
    ...defaultClaims,
  };

  return {
    getClaims: async () => claims,
    createToken: async () => 'test-access-token',
  };
}

export function createMockEnvService(): IEnvService {
  return {
    getEnv: () => 'test',
    getLogLevel: () => 'silent',
    getHost: () => '127.0.0.1',
    getPort: () => 5000,
    getWebUrl: () => 'http://127.0.0.1:5173',
    getJWTSecretKey: () => 'test-jwt-secret-key-32chars!!!!',
    getEncryptionKey: () => 'test-encryption-key-32chars!!!',
    getRefreshTokenSecretKey: () => 'test-refresh-secret-key-32chars!',
    getDatabaseHost: () => '127.0.0.1',
    getDatabasePort: () => 5432,
    getDatabaseName: () => 'test',
    getDatabaseUser: () => 'postgres',
    getDatabasePassword: () => 'postgres',
    getDatabaseSslMode: () => 'disable',
    getDatabaseTimezone: () => 'UTC',
    getRedisHost: () => '127.0.0.1',
    getRedisPort: () => 6379,
    getRedisPassword: () => '',
    getRedisDB: () => 0,
  } as IEnvService;
}


export function createMockPersistenceService(): IPersistenceService {
  return {
    begin: async (fn: (tx: unknown) => Promise<unknown>) => fn({}),
    getPool: () => ({}) as never,
  } as IPersistenceService;
}

export function createMockHashProvider(): HashProvider {
  return {
    hashPassword: async () => 'hashed-password',
    verifyPassword: async () => true,
    generateToken: () => 'generated-token',
    hashToken: () => 'hashed-token',
  } as HashProvider;
}

export function createMockAuditLogProvider(): AuditLogProvider {
  return {
    logTx: async () => undefined,
  } as unknown as AuditLogProvider;
}

export function authHeader(token = 'valid-token'): { authorization: string } {
  return { authorization: `Bearer ${token}` };
}
