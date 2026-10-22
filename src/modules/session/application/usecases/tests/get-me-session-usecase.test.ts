import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { SessionEntity } from '../../../domain/session-entity.js';
import { GetMeSessionUsecase } from '../get-me-session-usecase.js';

describe('GetMeSessionUsecase', () => {
  const session = new SessionEntity({
    userId: 1n,
    refreshTokenHash: 'hash',
  });

  it('should return session output by id for actor', async () => {
    const sessionRepository = {
      getByIdAndUserId: mock.fn(async () => session),
    };
    const ctx = {
      requestId: null,
      actorId: 1n,
      actorType: ActorTypeEnum.USER,
      ip: null,
      userAgent: null,
      deviceInfo: null,
      log: console,
    };
    const usecase = new GetMeSessionUsecase(sessionRepository as never);
    const output = await usecase.execute(ctx as never, { id: session.id });

    assert.equal(sessionRepository.getByIdAndUserId.mock.callCount(), 1);
    assert.equal(output.id, session.id.toString());
    assert.equal(output.userId, '1');
  });
});
