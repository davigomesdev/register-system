import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { Decimal } from 'decimal.js';

import { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';
import { ProductEntity } from '../../../domain/product-entity.js';
import { GetProductUsecase } from '../get-product-usecase.js';

describe('GetProductUsecase', () => {
  const product = new ProductEntity({
    sku: 'SKU-001',
    name: 'Product',
    costPrice: new Decimal('10'),
    gender: ProductGenderEnum.MALE,
  });

  it('should return product output by id', async () => {
    const productRepository = {
      get: mock.fn(async () => product),
    };
    const usecase = new GetProductUsecase(productRepository as never);
    const output = await usecase.execute({ id: product.id });

    assert.equal(productRepository.get.mock.callCount(), 1);
    assert.equal(output.id, product.id.toString());
    assert.equal(output.sku, 'SKU-001');
  });
});
