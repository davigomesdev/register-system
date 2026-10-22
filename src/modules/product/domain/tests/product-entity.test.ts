import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Decimal } from 'decimal.js';

import { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';
import { ProductEntity } from '../product-entity.js';

describe('ProductEntity', () => {
  it('should create with defaults', () => {
    const product = new ProductEntity({
      sku: 'SKU-001',
      name: 'Product',
      costPrice: new Decimal('10'),
      gender: ProductGenderEnum.UNDEFINED,
    });

    assert.equal(product.sku, 'SKU-001');
    assert.equal(product.name, 'Product');
    assert.equal(product.slug, null);
    assert.equal(product.description, null);
    assert.equal(product.costPrice.toString(), '10');
    assert.equal(product.gender, ProductGenderEnum.UNDEFINED);
    assert.equal(product.deletedAt, null);
    assert.ok(product.id);
  });

  it('should update fields', () => {
    const product = new ProductEntity({
      sku: 'SKU-001',
      name: 'Product',
      costPrice: new Decimal('10'),
      gender: ProductGenderEnum.MALE,
    });
    product.update({
      sku: 'SKU-002',
      name: 'Updated',
      slug: 'updated',
      description: 'new desc',
      costPrice: new Decimal('20.5'),
      gender: ProductGenderEnum.FEMALE,
    });

    assert.equal(product.sku, 'SKU-002');
    assert.equal(product.name, 'Updated');
    assert.equal(product.slug, 'updated');
    assert.equal(product.description, 'new desc');
    assert.equal(product.costPrice.toString(), '20.5');
    assert.equal(product.gender, ProductGenderEnum.FEMALE);
  });

  it('should soft delete', () => {
    const product = new ProductEntity({
      sku: 'SKU-001',
      name: 'Product',
      costPrice: new Decimal('10'),
      gender: ProductGenderEnum.MALE,
    });
    product.softDelete();

    assert.ok(product.deletedAt instanceof Date);
  });
});
