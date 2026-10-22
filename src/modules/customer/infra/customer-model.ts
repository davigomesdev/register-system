import type { IEncryptionService } from '#src/infra/encryption/encryption-service.js';

import { CustomerEntity } from '../domain/customer-entity.js';

export type CustomerRow = {
  id: string;
  name: string;
  enc_cpf_cnpj: string | null;
  email: string | null;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export class CustomerModel {
  public static toEntity(row: CustomerRow, encryptionService: IEncryptionService): CustomerEntity {
    return new CustomerEntity(
      {
        name: row.name,
        cpfCnpj: row.enc_cpf_cnpj ? encryptionService.decrypt(row.enc_cpf_cnpj) : null,
        email: row.email,
        phone: row.phone,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
      },
      BigInt(row.id),
    );
  }
}
