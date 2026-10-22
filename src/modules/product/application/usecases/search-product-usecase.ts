import type { SearchProductDto } from '../dtos/search-product-dto.js';
import type { ProductRepository, ProductSearchResult } from '../../domain/product-repository.js';

import { ProductSearchParams } from '../../domain/product-repository.js';

export class SearchProductUsecase {
  private readonly productRepository: ProductRepository;

  public constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  public async execute(input: SearchProductDto): Promise<ProductSearchResult> {
    return this.productRepository.search(new ProductSearchParams(input));
  }
}
