import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { UserModel } from '../user-model.js';
import { UserTypeEnum } from '#src/domain/enums/user-type-enum.js';
import { UserStatusEnum } from '#src/domain/enums/user-status-enum.js';

describe('UserModel', () => {
  it('should map row to entity', () => {
    const encryptionService = {
      decrypt: mock.fn((v: string) => `decrypted:${v}`),
      encrypt: mock.fn((v: string) => `encrypted:${v}`),
    };

    const entity = UserModel.toEntity(
      {
        id: '1',
        name: 'John',
        enc_cpf_cnpj: 'enc-cpf',
        email: 'john@example.com',
        phone: '85999999999',
        password_hash: 'hash',
        type: UserTypeEnum.MASTER,
        status: UserStatusEnum.ACTIVE,
        created_at: new Date('2026-01-01'),
        updated_at: new Date('2026-01-02'),
      },
      encryptionService as never,
    );

    assert.equal(entity.id, 1n);
    assert.equal(entity.name, 'John');
    assert.equal(entity.cpfCnpj, 'decrypted:enc-cpf');
    assert.equal(encryptionService.decrypt.mock.callCount(), 1);
  });
});
