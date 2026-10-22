import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Decimal } from 'decimal.js';

import { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';
import { ProductEntity } from '../../../domain/product-entity.js';
import { ProductOutputMapper } from '../product-output.js';

describe('ProductOutputMapper', () => {
  it('should map entity to output', () => {
    const product = new ProductEntity({
      sku: 'SKU-001',
      name: 'Product',
      slug: 'product',
      description: 'desc',
      costPrice: new Decimal('10.50'),
      gender: ProductGenderEnum.MALE,
    });

    const output = ProductOutputMapper.toOutput(product);

    assert.equal(output.id, product.id.toString());
    assert.equal(output.sku, 'SKU-001');
    assert.equal(output.name, 'Product');
    assert.equal(output.slug, 'product');
    assert.equal(output.description, 'desc');
    assert.equal(output.costPrice.toString(), '10.5');
    assert.equal(output.gender, ProductGenderEnum.MALE);
    assert.ok(output.createdAt instanceof Date);
    assert.ok(output.updatedAt instanceof Date);
  });
});
