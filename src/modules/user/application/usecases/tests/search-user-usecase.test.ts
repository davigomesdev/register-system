import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { SearchUserUsecase } from '../search-user-usecase.js';
import { UserSearchResult, UserSearchParams } from '../../../domain/user-repository.js';

describe('SearchUserUsecase', () => {
  it('should search users', async () => {
    const result = new UserSearchResult([], 0, new UserSearchParams({ filter: { search: null, type: null, status: null }, options: {} }));
    const userRepository = {
      search: mock.fn(async () => result),
    };
    const usecase = new SearchUserUsecase(userRepository as never);
    const output = await usecase.execute({
      filter: { search: null, type: null, status: null },
      options: {},
    } as never);

    assert.equal(userRepository.search.mock.callCount(), 1);
    assert.equal(output.total, 0);
    assert.deepEqual(output.items, []);
  });
});
