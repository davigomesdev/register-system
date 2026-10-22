import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { SearchCustomerUsecase } from '../search-customer-usecase.js';
import { CustomerSearchResult, CustomerSearchParams } from '../../../domain/customer-repository.js';

describe('SearchCustomerUsecase', () => {
  it('should search customers', async () => {
    const result = new CustomerSearchResult([], 0, new CustomerSearchParams({ filter: { search: null }, options: {} }));
    const customerRepository = {
      search: mock.fn(async () => result),
    };
    const usecase = new SearchCustomerUsecase(customerRepository as never);
    const output = await usecase.execute({
      filter: { search: null },
      options: {},
    } as never);

    assert.equal(customerRepository.search.mock.callCount(), 1);
    assert.equal(output.total, 0);
    assert.deepEqual(output.items, []);
  });
});
