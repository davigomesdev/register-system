import type { UserEntity } from '../../domain/user-entity.js';
import type { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import type { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';

export type UserOutput = {
  id: string;
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  type: UserTypeEnum;
  status: UserStatusEnum;
  createdAt: Date;
  updatedAt: Date;
};

export class UserOutputMapper {
  public static toOutput(user: UserEntity): UserOutput {
    return {
      id: user.id.toString(),
      name: user.name,
      cpfCnpj: user.cpfCnpj,
      email: user.email,
      phone: user.phone,
      type: user.type,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
