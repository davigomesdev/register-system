import type { Decimal } from 'decimal.js';
import type { ProductEntity } from '../../domain/product-entity.js';
import type { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';

export type ProductOutput = {
  id: string;
  sku: string;
  name: string;
  slug: string | null;
  description: string | null;
  costPrice: Decimal;
  gender: ProductGenderEnum;
  createdAt: Date;
  updatedAt: Date;
};

export class ProductOutputMapper {
  public static toOutput(product: ProductEntity): ProductOutput {
    return {
      id: product.id.toString(),
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      description: product.description,
      costPrice: product.costPrice,
      gender: product.gender,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
