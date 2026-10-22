import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';
import { createProductSchema } from '../create-product-dto.js';

describe('createProductSchema', () => {
  const valid = {
    sku: 'SKU-001',
    name: 'Product Name',
    slug: 'product-name',
    description: 'A product',
    costPrice: '10.50',
    gender: ProductGenderEnum.MALE,
  };

  it('should accept valid input', () => {
    assert.equal(createProductSchema.safeParse(valid).success, true);
  });

  it('should accept numeric costPrice', () => {
    assert.equal(createProductSchema.safeParse({ ...valid, costPrice: 10.5 }).success, true);
  });

  it('should reject empty sku', () => {
    assert.equal(createProductSchema.safeParse({ ...valid, sku: '' }).success, false);
  });

  it('should reject empty name', () => {
    assert.equal(createProductSchema.safeParse({ ...valid, name: '' }).success, false);
  });

  it('should reject negative costPrice', () => {
    assert.equal(createProductSchema.safeParse({ ...valid, costPrice: '-1' }).success, false);
  });

  it('should reject invalid gender', () => {
    assert.equal(createProductSchema.safeParse({ ...valid, gender: 'INVALID' }).success, false);
  });
});
