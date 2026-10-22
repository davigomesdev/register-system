import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SortDirection, SearchParams, SearchResult } from '../searchable-repository.js';

describe('SearchParams', () => {
  it('should apply defaults', () => {
    const params = new SearchParams({ filter: {}, options: {} }, 'createdAt');

    assert.equal(params.page, 1);
    assert.equal(params.perPage, 15);
    assert.equal(params.sort, 'createdAt');
    assert.equal(params.sortDir, SortDirection.Desc);
  });

  it('should clamp page and perPage to min 1', () => {
    const params = new SearchParams({ page: 0, perPage: 0, filter: {}, options: {} }, 'name');
    assert.equal(params.page, 1);
    assert.equal(params.perPage, 1);
  });

  it('should compute offset', () => {
    const params = new SearchParams({ page: 3, perPage: 10, filter: {}, options: {} }, 'name');
    assert.equal(params.offset(), 20);
  });
});

describe('SearchResult', () => {
  it('should compute lastPage', () => {
    const params = new SearchParams({ page: 1, perPage: 10, filter: {}, options: {} }, 'name');
    const result = new SearchResult([], 25, params);

    assert.equal(result.lastPage(), 3);
    assert.equal(result.total, 25);
  });

  it('should return lastPage 1 when total is 0', () => {
    const params = new SearchParams({ filter: {}, options: {} }, 'name');
    const result = new SearchResult([], 0, params);
    assert.equal(result.lastPage(), 1);
  });
});
