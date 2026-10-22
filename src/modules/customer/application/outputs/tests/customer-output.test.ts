import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CustomerEntity } from '../../../domain/customer-entity.js';
import { CustomerOutputMapper } from '../customer-output.js';

describe('CustomerOutputMapper', () => {
  it('should map entity to output', () => {
    const customer = new CustomerEntity({
      name: 'John',
      cpfCnpj: '12345678909',
      email: 'john@example.com',
      phone: '85999999999',
    });

    const output = CustomerOutputMapper.toOutput(customer);

    assert.equal(output.id, customer.id.toString());
    assert.equal(output.name, 'John');
    assert.equal(output.email, 'john@example.com');
    assert.equal(output.cpfCnpj, '12345678909');
    assert.equal(output.phone, '85999999999');
    assert.ok(output.createdAt instanceof Date);
    assert.ok(output.updatedAt instanceof Date);
  });
});
