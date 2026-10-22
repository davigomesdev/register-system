import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Presenter, CollectionPresenter } from '../presenter.js';

describe('Presenter', () => {
  it('should wrap single output', () => {
    const result = Presenter.wrapper({ id: '1', name: 'John' });
    assert.deepEqual(result, { data: { id: '1', name: 'John' } });
  });
});

describe('CollectionPresenter', () => {
  it('should wrap collection with meta', () => {
    const result = CollectionPresenter.wrapper([{ id: '1' }], {
      currentPage: 1,
      perPage: 15,
      lastPage: 1,
      total: 1,
    });

    assert.deepEqual(result.data, [{ id: '1' }]);
    assert.equal(result.meta.total, 1);
    assert.equal(result.meta.currentPage, 1);
  });
});
