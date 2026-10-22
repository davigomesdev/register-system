import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { SubjectTypeEnum } from '#src/domain/enums/subject-type-enum.js';
import { UnauthorizedError } from '#src/domain/errors/unauthorized-error.js';
import { ForbiddenError } from '#src/domain/errors/forbidden-error.js';

import { JwtGuard } from '../jwt-guard.js';

describe('JwtGuard', () => {
  it('should throw UnauthorizedError without Bearer token', async () => {
    const jwtService = {
      getClaims: mock.fn(),
    };
    const guard = new JwtGuard(jwtService as never, SubjectTypeEnum.USER);

    await assert.rejects(
      () => guard.handle({ headers: {} } as never, {} as never, {} as never),
      UnauthorizedError,
    );
  });

  it('should set claims on request', async () => {
    const claims = {
      subject: 1n,
      issuer: SubjectTypeEnum.USER,
      accessLevel: 'MASTER',
      expiresAt: 1,
      issuedAt: 1,
    };
    const jwtService = {
      getClaims: mock.fn(async () => claims),
    };
    const guard = new JwtGuard(jwtService as never, SubjectTypeEnum.USER, ['MASTER']);
    const req = { headers: { authorization: 'Bearer token' }, claims: null };

    await guard.handle(req as never, {} as never, {} as never);

    assert.equal(jwtService.getClaims.mock.callCount(), 1);
    assert.deepEqual(req.claims, claims);
  });

  it('should throw ForbiddenError when access level not allowed', async () => {
    const jwtService = {
      getClaims: mock.fn(async () => ({
        subject: 1n,
        issuer: SubjectTypeEnum.USER,
        accessLevel: 'PARTNER',
        expiresAt: 1,
        issuedAt: 1,
      })),
    };
    const guard = new JwtGuard(jwtService as never, SubjectTypeEnum.USER, ['MASTER']);

    await assert.rejects(
      () =>
        guard.handle(
          { headers: { authorization: 'Bearer token' }, claims: null } as never,
          {} as never,
          {} as never,
        ),
      ForbiddenError,
    );
  });
});
