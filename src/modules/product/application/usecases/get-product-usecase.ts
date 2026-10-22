import type { ProductOutput } from '../outputs/product-output.js';
import type { ProductEntity } from '../../domain/product-entity.js';
import type { ProductRepository } from '../../domain/product-repository.js';
import type { GetProductParamsDto } from '../dtos/get-product-dto.js';

import { ProductOutputMapper } from '../outputs/product-output.js';

export class GetProductUsecase {
  private readonly productRepository: ProductRepository;

  public constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
  }

  public async execute(input: GetProductParamsDto): Promise<ProductOutput> {
    const product: ProductEntity = await this.productRepository.get(input.id);
    return ProductOutputMapper.toOutput(product);
  }
}
