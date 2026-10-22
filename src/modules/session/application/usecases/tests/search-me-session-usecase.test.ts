import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { SearchMeSessionUsecase } from '../search-me-session-usecase.js';
import { SessionSearchResult, SessionSearchParams } from '../../../domain/session-repository.js';

describe('SearchMeSessionUsecase', () => {
  it('should search sessions for actor', async () => {
    const result = new SessionSearchResult([], 0, new SessionSearchParams({ filter: {}, options: {} }));
    const sessionRepository = {
      search: mock.fn(async () => result),
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
    const usecase = new SearchMeSessionUsecase(sessionRepository as never);
    const output = await usecase.execute(ctx as never, {
      filter: {},
      options: {},
    } as never);

    assert.equal(sessionRepository.search.mock.callCount(), 1);
    assert.equal(output.total, 0);
    assert.deepEqual(output.items, []);
  });
});
