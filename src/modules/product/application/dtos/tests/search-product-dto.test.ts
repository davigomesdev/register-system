import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';
import { searchProductSchema } from '../search-product-dto.js';

describe('searchProductSchema', () => {
  it('should accept empty query', () => {
    assert.equal(searchProductSchema.safeParse({}).success, true);
  });

  it('should accept pagination, search and gender', () => {
    assert.equal(
      searchProductSchema.safeParse({
        page: '1',
        perPage: '15',
        search: 'shirt',
        gender: ProductGenderEnum.MALE,
      }).success,
      true,
    );
  });
});
