import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { SearchProductUsecase } from '../search-product-usecase.js';
import { ProductSearchResult, ProductSearchParams } from '../../../domain/product-repository.js';

describe('SearchProductUsecase', () => {
  it('should search products', async () => {
    const result = new ProductSearchResult([], 0, new ProductSearchParams({ filter: { search: null, gender: null }, options: {} }));
    const productRepository = {
      search: mock.fn(async () => result),
    };
    const usecase = new SearchProductUsecase(productRepository as never);
    const output = await usecase.execute({
      filter: { search: null, gender: null },
      options: {},
    } as never);

    assert.equal(productRepository.search.mock.callCount(), 1);
    assert.equal(output.total, 0);
    assert.deepEqual(output.items, []);
  });
});
