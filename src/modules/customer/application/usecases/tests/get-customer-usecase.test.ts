import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { CustomerEntity } from '../../../domain/customer-entity.js';
import { GetCustomerUsecase } from '../get-customer-usecase.js';

describe('GetCustomerUsecase', () => {
  const customer = new CustomerEntity({
    name: 'John',
    cpfCnpj: '12345678909',
    email: 'john@example.com',
    phone: '85999999999',
  });

  it('should return customer output by id', async () => {
    const customerRepository = {
      get: mock.fn(async () => customer),
    };
    const usecase = new GetCustomerUsecase(customerRepository as never);
    const output = await usecase.execute({ id: customer.id });

    assert.equal(customerRepository.get.mock.callCount(), 1);
    assert.equal(output.id, customer.id.toString());
    assert.equal(output.email, 'john@example.com');
  });
});
