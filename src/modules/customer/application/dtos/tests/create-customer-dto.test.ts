import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createCustomerSchema } from '../create-customer-dto.js';

describe('createCustomerSchema', () => {
  const valid = {
    name: 'John Doe',
    cpfCnpj: '52998224725',
    email: 'john@example.com',
    phone: '+5585999999999',
  };

  it('should accept valid input', () => {
    assert.equal(createCustomerSchema.safeParse(valid).success, true);
  });

  it('should accept input with only name', () => {
    assert.equal(createCustomerSchema.safeParse({ name: 'Jane' }).success, true);
  });

  it('should reject empty name', () => {
    assert.equal(createCustomerSchema.safeParse({ ...valid, name: '' }).success, false);
  });

  it('should reject invalid email', () => {
    assert.equal(createCustomerSchema.safeParse({ ...valid, email: 'not-email' }).success, false);
  });

  it('should reject invalid cpfCnpj', () => {
    assert.equal(createCustomerSchema.safeParse({ ...valid, cpfCnpj: '000' }).success, false);
  });

  it('should reject invalid phone', () => {
    assert.equal(createCustomerSchema.safeParse({ ...valid, phone: '123' }).success, false);
  });
});
