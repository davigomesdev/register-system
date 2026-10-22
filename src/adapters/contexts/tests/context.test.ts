import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { UnauthorizedError } from '#src/domain/errors/unauthorized-error.js';

import { ContextFactory } from '../context.js';

describe('ContextFactory', () => {
  const logger = console as never;

  it('should build system context', () => {
    const ctx = ContextFactory.system(logger);

    assert.equal(ctx.actorId, null);
    assert.equal(ctx.actorType, ActorTypeEnum.SYSTEM);
    assert.equal(ctx.requestId, null);
  });

  it('should build context from request without claims', () => {
    const req = {
      id: 'req-1',
      claims: null,
      ip: '127.0.0.1',
      headers: { 'user-agent': 'test-agent' },
      log: logger,
    };

    const ctx = ContextFactory.fromRequest(req as never);

    assert.equal(ctx.requestId, 'req-1');
    assert.equal(ctx.actorId, null);
    assert.equal(ctx.actorType, ActorTypeEnum.SYSTEM);
    assert.equal(ctx.ip, '127.0.0.1');
    assert.equal(ctx.userAgent, 'test-agent');
  });

  it('should build context from request with claims', () => {
    const req = {
      id: 'req-2',
      claims: { subject: 99n },
      ip: '10.0.0.1',
      headers: { 'user-agent': 'ua', 'x-device-info': 'device' },
      log: logger,
    };

    const ctx = ContextFactory.fromRequest(req as never);

    assert.equal(ctx.actorId, 99n);
    assert.equal(ctx.actorType, ActorTypeEnum.USER);
    assert.equal(ctx.deviceInfo, 'device');
  });

  it('should return actorId or throw', () => {
    const withActor = ContextFactory.system(logger);
    withActor.actorId = 5n;

    assert.equal(ContextFactory.getActorId(withActor), 5n);

    assert.throws(() => ContextFactory.getActorId(ContextFactory.system(logger)), UnauthorizedError);
  });
});
