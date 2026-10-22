import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { updateCustomerParamsSchema, updateCustomerBodySchema } from '../update-customer-dto.js';

describe('updateCustomerParamsSchema', () => {
  it('should coerce id to bigint', () => {
    const result = updateCustomerParamsSchema.safeParse({ id: '123' });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.id, 123n);
    }
  });

  it('should reject invalid id', () => {
    assert.equal(updateCustomerParamsSchema.safeParse({ id: 'abc' }).success, false);
  });
});

describe('updateCustomerBodySchema', () => {
  const valid = {
    name: 'John Doe',
    cpfCnpj: '52998224725',
    email: 'john@example.com',
    phone: '+5585999999999',
  };

  it('should accept valid input', () => {
    assert.equal(updateCustomerBodySchema.safeParse(valid).success, true);
  });

  it('should reject empty name', () => {
    assert.equal(updateCustomerBodySchema.safeParse({ ...valid, name: '' }).success, false);
  });

  it('should reject invalid email', () => {
    assert.equal(updateCustomerBodySchema.safeParse({ ...valid, email: 'not-email' }).success, false);
  });

  it('should reject invalid cpfCnpj', () => {
    assert.equal(updateCustomerBodySchema.safeParse({ ...valid, cpfCnpj: '000' }).success, false);
  });
});
