import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';
import { updateProductParamsSchema, updateProductBodySchema } from '../update-product-dto.js';

describe('updateProductParamsSchema', () => {
  it('should coerce id to bigint', () => {
    const result = updateProductParamsSchema.safeParse({ id: '123' });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.id, 123n);
    }
  });

  it('should reject invalid id', () => {
    assert.equal(updateProductParamsSchema.safeParse({ id: 'abc' }).success, false);
  });
});

describe('updateProductBodySchema', () => {
  const valid = {
    sku: 'SKU-001',
    name: 'Product Name',
    slug: 'product-name',
    description: 'A product',
    costPrice: '10.50',
    gender: ProductGenderEnum.FEMALE,
  };

  it('should accept valid input', () => {
    assert.equal(updateProductBodySchema.safeParse(valid).success, true);
  });

  it('should reject empty sku', () => {
    assert.equal(updateProductBodySchema.safeParse({ ...valid, sku: '' }).success, false);
  });

  it('should reject negative costPrice', () => {
    assert.equal(updateProductBodySchema.safeParse({ ...valid, costPrice: '-1' }).success, false);
  });
});
