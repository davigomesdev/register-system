import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';
import { ProductModel } from '../product-model.js';

describe('ProductModel', () => {
  it('should map row to entity', () => {
    const entity = ProductModel.toEntity({
      id: '1',
      sku: 'SKU-001',
      name: 'Product',
      slug: 'product',
      description: 'desc',
      cost_price: '10.5000',
      gender: ProductGenderEnum.MALE,
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-02'),
      deleted_at: null,
    });

    assert.equal(entity.id, 1n);
    assert.equal(entity.sku, 'SKU-001');
    assert.equal(entity.name, 'Product');
    assert.equal(entity.slug, 'product');
    assert.equal(entity.description, 'desc');
    assert.equal(entity.costPrice.toString(), '10.5');
    assert.equal(entity.gender, ProductGenderEnum.MALE);
    assert.equal(entity.deletedAt, null);
  });

  it('should map nullable fields', () => {
    const entity = ProductModel.toEntity({
      id: '2',
      sku: 'SKU-002',
      name: 'Other',
      slug: null,
      description: null,
      cost_price: '0',
      gender: ProductGenderEnum.UNDEFINED,
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-02'),
      deleted_at: new Date('2026-01-03'),
    });

    assert.equal(entity.slug, null);
    assert.equal(entity.description, null);
    assert.equal(entity.costPrice.toString(), '0');
    assert.equal(entity.gender, ProductGenderEnum.UNDEFINED);
    assert.ok(entity.deletedAt instanceof Date);
  });
});
