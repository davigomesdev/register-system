import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SubjectTypeEnum } from '#src/domain/enums/subject-type-enum.js';
import { UnauthorizedError } from '#src/domain/errors/unauthorized-error.js';

import { JwtService } from '../jwt-service.js';

describe('JwtService', () => {
  const envService = {
    getJWTSecretKey: () => 'test-secret-key-for-jwt-signing',
  };

  const jwtService = new JwtService(envService as never);

  it('should create and verify token', async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = await jwtService.createToken(1n, SubjectTypeEnum.USER, 'MASTER', now);
    const claims = await jwtService.getClaims(token, SubjectTypeEnum.USER);

    assert.equal(claims.subject, 1n);
    assert.equal(claims.issuer, SubjectTypeEnum.USER);
    assert.equal(claims.accessLevel, 'MASTER');
  });

  it('should throw UnauthorizedError for invalid token', async () => {
    await assert.rejects(() => jwtService.getClaims('invalid', SubjectTypeEnum.USER), UnauthorizedError);
  });
});
