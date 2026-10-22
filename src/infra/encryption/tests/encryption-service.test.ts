import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { InternalServerError } from '#src/domain/errors/internal-server-error.js';

import { EncryptionService } from '../encryption-service.js';

describe('EncryptionService', () => {
  const key = Buffer.alloc(32, 7).toString('base64');
  const envService = {
    getEncryptionKey: () => key,
  };
  const service = new EncryptionService(envService as never);

  it('should encrypt and decrypt', () => {
    const encoded = service.encrypt('12345678909');
    assert.equal(typeof encoded, 'string');
    assert.equal(service.decrypt(encoded), '12345678909');
  });

  it('should produce different ciphertext each time', () => {
    assert.notEqual(service.encrypt('same'), service.encrypt('same'));
  });

  it('should throw on invalid key length', () => {
    assert.throws(
      () => new EncryptionService({ getEncryptionKey: () => Buffer.alloc(16).toString('base64') } as never),
      /Invalid ENCRYPTION_KEY/,
    );
  });

  it('should throw InternalServerError on short payload', () => {
    assert.throws(() => service.decrypt('abc'), InternalServerError);
  });
});
