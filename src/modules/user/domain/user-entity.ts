import type { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';

import { Entity } from '#src/domain/entities/entity.js';
import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';

type CreateUserProps = {
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  passwordHash: string;
  type: UserTypeEnum;
  status?: UserStatusEnum;
  createdAt?: Date;
  updatedAt?: Date;
};

type UpdateUserProps = {
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  type: UserTypeEnum;
};

export class UserEntity extends Entity<CreateUserProps> {
  public constructor(props: CreateUserProps, id?: bigint) {
    super(props, id);

    this.props.status = this.props.status ?? UserStatusEnum.ACTIVE;
    this.props.createdAt = this.props.createdAt ?? new Date();
    this.props.updatedAt = this.props.updatedAt ?? new Date();
  }

  public get name(): string {
    return this.props.name;
  }

  public get cpfCnpj(): string {
    return this.props.cpfCnpj;
  }

  public get email(): string {
    return this.props.email;
  }

  public get phone(): string {
    return this.props.phone;
  }

  public get passwordHash(): string {
    return this.props.passwordHash;
  }

  public get type(): UserTypeEnum {
    return this.props.type;
  }

  public get status(): UserStatusEnum {
    return this.props.status ?? UserStatusEnum.ACTIVE;
  }

  public get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  public get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  public override toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      ...this.props,
      cpfCnpj: '********',
      passwordHash: '********',
    };
  }

  public isActive(): boolean {
    return this.status === UserStatusEnum.ACTIVE;
  }

  public isInactive(): boolean {
    return this.status === UserStatusEnum.INACTIVE;
  }

  public active(): UserEntity {
    this.props.status = UserStatusEnum.ACTIVE;
    this.props.updatedAt = new Date();

    return this;
  }

  public inactive(): UserEntity {
    this.props.status = UserStatusEnum.INACTIVE;
    this.props.updatedAt = new Date();

    return this;
  }

  public update(props: UpdateUserProps): UserEntity {
    this.props.name = props.name;
    this.props.cpfCnpj = props.cpfCnpj;
    this.props.email = props.email;
    this.props.phone = props.phone;
    this.props.type = props.type;
    this.props.updatedAt = new Date();

    return this;
  }

  public updateStatus(status: UserStatusEnum): UserEntity {
    this.props.status = status;
    this.props.updatedAt = new Date();

    return this;
  }

  public updatePasswordHash(passwordHash: string): UserEntity {
    this.props.passwordHash = passwordHash;
    this.props.updatedAt = new Date();

    return this;
  }
}
