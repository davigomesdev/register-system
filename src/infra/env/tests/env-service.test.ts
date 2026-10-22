import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';

import { EnvService } from '../env-service.js';

describe('EnvService', () => {
  const original = { ...process.env };

  before(() => {
    process.env['ENV'] = 'test';
    process.env['LOG_LEVEL'] = 'info';
    process.env['HOST'] = '0.0.0.0';
    process.env['PORT'] = '5000';
    process.env['WEB_URL'] = 'http://localhost';
    process.env['DATABASE_HOST'] = 'localhost';
    process.env['DATABASE_PORT'] = '5432';
    process.env['DATABASE_NAME'] = 'db';
    process.env['DATABASE_USER'] = 'user';
    process.env['DATABASE_PASSWORD'] = 'pass';
    process.env['DATABASE_SSLMODE'] = 'disable';
    process.env['DATABASE_TIMEZONE'] = 'UTC';
    process.env['REDIS_DB'] = '0';
    process.env['REDIS_HOST'] = 'localhost';
    process.env['REDIS_PORT'] = '6379';
    process.env['REDIS_PASSWORD'] = '';
    process.env['JWT_SECRET_KEY'] = 'jwt-secret';
    process.env['ENCRYPTION_KEY'] = Buffer.alloc(32, 1).toString('base64');
    process.env['REFRESH_TOKEN_SECRET_KEY'] = 'refresh-secret';
  });

  after(() => {
    process.env = original;
  });

  it('should read env values', () => {
    const env = new EnvService();

    assert.equal(env.getEnv(), 'test');
    assert.equal(env.getPort(), 5000);
    assert.equal(env.getDatabaseHost(), 'localhost');
    assert.equal(env.getJWTSecretKey(), 'jwt-secret');
    assert.equal(env.getRefreshTokenSecretKey(), 'refresh-secret');
  });
});
