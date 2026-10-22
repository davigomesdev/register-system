import type { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';

import { Decimal } from 'decimal.js';
import { ProductEntity } from '../domain/product-entity.js';

export type ProductRow = {
  id: string;
  sku: string;
  name: string;
  slug: string | null;
  description: string | null;
  cost_price: string;
  gender: ProductGenderEnum;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export class ProductModel {
  public static toEntity(row: ProductRow): ProductEntity {
    return new ProductEntity(
      {
        sku: row.sku,
        name: row.name,
        slug: row.slug,
        description: row.description,
        costPrice: new Decimal(row.cost_price),
        gender: row.gender,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
      },
      BigInt(row.id),
    );
  }
}
