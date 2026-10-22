import type { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import type { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';
import type { IEncryptionService } from '#src/infra/encryption/encryption-service.js';

import { UserEntity } from '../domain/user-entity.js';

export type UserRow = {
  id: string;
  name: string;
  enc_cpf_cnpj: string;
  email: string;
  phone: string;
  password_hash: string;
  type: UserTypeEnum;
  status: UserStatusEnum;
  created_at: Date;
  updated_at: Date;
};

export class UserModel {
  public static toEntity(row: UserRow, encryptionService: IEncryptionService): UserEntity {
    return new UserEntity(
      {
        name: row.name,
        cpfCnpj: encryptionService.decrypt(row.enc_cpf_cnpj),
        email: row.email,
        phone: row.phone,
        passwordHash: row.password_hash,
        type: row.type,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      BigInt(row.id),
    );
  }
}
