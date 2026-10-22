import type { Decimal } from 'decimal.js';
import type { ProductGenderEnum } from '#src/domain/enums/product-gender-enum.js';

import { Entity } from '#src/domain/entities/entity.js';

type CreateProductProps = {
  sku: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  costPrice: Decimal;
  gender: ProductGenderEnum;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

type UpdateProductProps = {
  sku: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  costPrice: Decimal;
  gender: ProductGenderEnum;
};

export class ProductEntity extends Entity<CreateProductProps> {
  public constructor(props: CreateProductProps, id?: bigint) {
    super(props, id);

    this.props.slug = this.props.slug ?? null;
    this.props.description = this.props.description ?? null;
    this.props.createdAt = this.props.createdAt ?? new Date();
    this.props.updatedAt = this.props.updatedAt ?? new Date();
    this.props.deletedAt = this.props.deletedAt ?? null;
  }

  public get sku(): string {
    return this.props.sku;
  }

  public get name(): string {
    return this.props.name;
  }

  public get slug(): string | null {
    return this.props.slug ?? null;
  }

  public get description(): string | null {
    return this.props.description ?? null;
  }

  public get costPrice(): Decimal {
    return this.props.costPrice;
  }

  public get gender(): ProductGenderEnum {
    return this.props.gender;
  }

  public get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  public get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  public get deletedAt(): Date | null {
    return this.props.deletedAt ?? null;
  }

  public update(props: UpdateProductProps): ProductEntity {
    this.props.sku = props.sku;
    this.props.name = props.name;
    this.props.slug = props.slug ?? null;
    this.props.description = props.description ?? null;
    this.props.costPrice = props.costPrice;
    this.props.gender = props.gender;
    this.props.updatedAt = new Date();

    return this;
  }

  public softDelete(): ProductEntity {
    this.props.deletedAt = new Date();
    return this;
  }
}
