import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { CustomerModel } from '../customer-model.js';

describe('CustomerModel', () => {
  it('should map row to entity', () => {
    const encryptionService = {
      decrypt: mock.fn((v: string) => `decrypted:${v}`),
      encrypt: mock.fn((v: string) => `encrypted:${v}`),
    };

    const entity = CustomerModel.toEntity(
      {
        id: '1',
        name: 'John',
        enc_cpf_cnpj: 'enc-cpf',
        email: 'john@example.com',
        phone: '85999999999',
        created_at: new Date('2026-01-01'),
        updated_at: new Date('2026-01-02'),
        deleted_at: null,
      },
      encryptionService as never,
    );

    assert.equal(entity.id, 1n);
    assert.equal(entity.name, 'John');
    assert.equal(entity.cpfCnpj, 'decrypted:enc-cpf');
    assert.equal(entity.email, 'john@example.com');
    assert.equal(entity.phone, '85999999999');
    assert.equal(entity.deletedAt, null);
    assert.equal(encryptionService.decrypt.mock.callCount(), 1);
  });

  it('should map null cpfCnpj without decrypt', () => {
    const encryptionService = {
      decrypt: mock.fn((v: string) => `decrypted:${v}`),
      encrypt: mock.fn((v: string) => `encrypted:${v}`),
    };

    const entity = CustomerModel.toEntity(
      {
        id: '2',
        name: 'Jane',
        enc_cpf_cnpj: null,
        email: null,
        phone: null,
        created_at: new Date('2026-01-01'),
        updated_at: new Date('2026-01-02'),
        deleted_at: new Date('2026-01-03'),
      },
      encryptionService as never,
    );

    assert.equal(entity.id, 2n);
    assert.equal(entity.cpfCnpj, null);
    assert.equal(entity.email, null);
    assert.equal(entity.phone, null);
    assert.ok(entity.deletedAt instanceof Date);
    assert.equal(encryptionService.decrypt.mock.callCount(), 0);
  });
});
