import type { FastifyBaseLogger, FastifyInstance } from 'fastify';

import Fastify from 'fastify';

import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';

import { EnvService } from './infra/env/env-service.js';
import { JwtService } from './infra/jwt/jwt-service.js';
import { CacheService } from './infra/cache/cache-service.js';
import { EncryptionService } from './infra/encryption/encryption-service.js';
import { PersistenceService } from './infra/persistence/persistence-service.js';

import { ErrorFilter } from './adapters/interceptors/error-filter.js';
import { HashProvider } from './application/providers/hash-provider.js';
import { AuditLogProvider } from './modules/audit-log/application/providers/audit-log-provider.js';

import { UserRoutes } from './modules/user/adapters/user-router.js';
import { SessionRoutes } from './modules/session/adapters/session-router.js';
import { ProductRoutes } from './modules/product/adapters/product-router.js';
import { CustomerRoutes } from './modules/customer/adapters/customer-router.js';
import { AuditLogRoutes } from './modules/audit-log/adapters/audit-log-router.js';

import { UserPersistenceRepository } from './modules/user/infra/user-persistence-repository.js';
import { SessionPersistenceRepository } from './modules/session/infra/session-persistence-repository.js';
import { ProductPersistenceRepository } from './modules/product/infra/product-persistence-repository.js';
import { CustomerPersistenceRepository } from './modules/customer/infra/customer-persistence-repository.js';
import { AuditLogPersistenceRepository } from './modules/audit-log/infra/audit-log-persistence-repository.js';

import { pino } from 'pino';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

async function main(): Promise<void> {
  const envService: EnvService = new EnvService();
  const loggerService: FastifyBaseLogger = pino({ level: envService.getLogLevel() });

  const jwtService: JwtService = new JwtService(envService);
  const cacheService: CacheService = new CacheService(loggerService, envService);
  const encryptionService: EncryptionService = new EncryptionService(envService);
  const persistenceService: PersistenceService = new PersistenceService(loggerService, envService);

  const userPersistenceRepository: UserPersistenceRepository = new UserPersistenceRepository(encryptionService, persistenceService);
  const productPersistenceRepository: ProductPersistenceRepository = new ProductPersistenceRepository(persistenceService);
  const customerPersistenceRepository: CustomerPersistenceRepository = new CustomerPersistenceRepository(encryptionService, persistenceService);
  const auditLogPersistenceRepository: AuditLogPersistenceRepository = new AuditLogPersistenceRepository(encryptionService, persistenceService);

  const hashProvider: HashProvider = new HashProvider();
  const auditLogProvider: AuditLogProvider = new AuditLogProvider(auditLogPersistenceRepository);
  const sessionPersistenceRepository: SessionPersistenceRepository = new SessionPersistenceRepository(persistenceService);

  const app: FastifyInstance = Fastify({
    loggerInstance: loggerService,
    trustProxy: (_address: string, hop: number): boolean => hop < 1,
    bodyLimit: 1024 * 1024,
    requestTimeout: 15_000,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(ErrorFilter.handle);
  app.setNotFoundHandler(ErrorFilter.notFound);

  await app.register(helmet);
  await app.register(cookie);

  await app.register(cors, {
    origin: envService.getWebUrl(),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin'],
    credentials: true,
    maxAge: 86_400,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    redis: cacheService.getClient(),
    nameSpace: 'register-system-rl-',
    skipOnError: true,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
      fields: 10,
      parts: 11,
      fieldSize: 1024 * 1024,
    },
  });

  app.addHook('onClose', async (): Promise<void> => {
    await cacheService.disconnect();
  });

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, (): void => {
      void app.close().then((): never => process.exit(0));
    });
  }

  app.get('/health', { config: { rateLimit: false } }, async () => ({ status: 'ok' }));

  app.register(
    async (api: FastifyInstance): Promise<void> => {
      UserRoutes.register(api, jwtService, persistenceService, hashProvider, auditLogProvider, userPersistenceRepository);
      SessionRoutes.register(api, envService, jwtService, persistenceService, hashProvider, auditLogProvider, userPersistenceRepository, sessionPersistenceRepository);
      ProductRoutes.register(api, jwtService, persistenceService, auditLogProvider, productPersistenceRepository);
      CustomerRoutes.register(api, jwtService, persistenceService, auditLogProvider, customerPersistenceRepository);
      AuditLogRoutes.register(api, jwtService, auditLogPersistenceRepository);
    },
    { prefix: '/api/v1' },
  );

  await app.listen({
    host: envService.getHost(),
    port: envService.getPort(),
  });
}

main().catch((error) => {
  pino().fatal({ err: error }, 'Failed to start application');
  process.exit(1);
});
