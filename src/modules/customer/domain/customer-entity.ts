import { Entity } from '#src/domain/entities/entity.js';

type CreateCustomerProps = {
  name: string;
  cpfCnpj?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

type UpdateCustomerProps = {
  name: string;
  cpfCnpj?: string | null;
  email?: string | null;
  phone?: string | null;
};

export class CustomerEntity extends Entity<CreateCustomerProps> {
  public constructor(props: CreateCustomerProps, id?: bigint) {
    super(props, id);

    this.props.cpfCnpj = this.props.cpfCnpj ?? null;
    this.props.email = this.props.email ?? null;
    this.props.phone = this.props.phone ?? null;
    this.props.createdAt = this.props.createdAt ?? new Date();
    this.props.updatedAt = this.props.updatedAt ?? new Date();
    this.props.deletedAt = this.props.deletedAt ?? null;
  }

  public get name(): string {
    return this.props.name;
  }

  public get cpfCnpj(): string | null {
    return this.props.cpfCnpj ?? null;
  }

  public get email(): string | null {
    return this.props.email ?? null;
  }

  public get phone(): string | null {
    return this.props.phone ?? null;
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

  public override toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      ...this.props,
      cpfCnpj: this.props.cpfCnpj ? '********' : null,
    };
  }

  public update(props: UpdateCustomerProps): CustomerEntity {
    this.props.name = props.name;
    this.props.cpfCnpj = props.cpfCnpj ?? null;
    this.props.email = props.email ?? null;
    this.props.phone = props.phone ?? null;
    this.props.updatedAt = new Date();

    return this;
  }

  public softDelete(): CustomerEntity {
    this.props.deletedAt = new Date();
    return this;
  }
}
