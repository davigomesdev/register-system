import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CustomerEntity } from '../customer-entity.js';

describe('CustomerEntity', () => {
  it('should create with defaults', () => {
    const customer = new CustomerEntity({ name: 'John' });

    assert.equal(customer.name, 'John');
    assert.equal(customer.cpfCnpj, null);
    assert.equal(customer.email, null);
    assert.equal(customer.phone, null);
    assert.equal(customer.deletedAt, null);
    assert.ok(customer.id);
    assert.ok(customer.createdAt instanceof Date);
    assert.ok(customer.updatedAt instanceof Date);
  });

  it('should update fields', () => {
    const customer = new CustomerEntity({ name: 'John' });
    customer.update({
      name: 'Jane',
      cpfCnpj: '12345678909',
      email: 'jane@example.com',
      phone: '85988888888',
    });

    assert.equal(customer.name, 'Jane');
    assert.equal(customer.cpfCnpj, '12345678909');
    assert.equal(customer.email, 'jane@example.com');
    assert.equal(customer.phone, '85988888888');
  });

  it('should soft delete', () => {
    const customer = new CustomerEntity({ name: 'John' });
    customer.softDelete();

    assert.ok(customer.deletedAt instanceof Date);
  });

  it('should mask cpfCnpj in toJSON', () => {
    const customer = new CustomerEntity({ name: 'John', cpfCnpj: '12345678909' });
    const json = customer.toJSON();

    assert.equal(json.cpfCnpj, '********');
    assert.equal(json.name, 'John');
  });
});
