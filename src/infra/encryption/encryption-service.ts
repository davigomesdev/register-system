import type { IEnvService } from '#src/infra/env/env-service.js';
import type { CipherGCM, DecipherGCM } from 'node:crypto';

import { InternalServerError } from '#src/domain/errors/internal-server-error.js';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export interface IEncryptionService {
  encrypt(text: string): string;
  decrypt(encoded: string): string;
}

export class EncryptionService implements IEncryptionService {
  private readonly key: Buffer;

  public constructor(envService: IEnvService) {
    this.key = Buffer.from(envService.getEncryptionKey(), 'base64');

    if (this.key.length !== 32) {
      throw new Error('Invalid ENCRYPTION_KEY: must be 32 bytes');
    }
  }

  public encrypt(text: string): string {
    try {
      const nonce: Buffer = randomBytes(12);
      const cipher: CipherGCM = createCipheriv('aes-256-gcm', this.key, nonce);
      const ciphertext: Buffer = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

      return Buffer.concat([nonce, ciphertext, cipher.getAuthTag()]).toString('base64');
    } catch {
      throw new InternalServerError();
    }
  }

  public decrypt(encoded: string): string {
    const data: Buffer = Buffer.from(encoded, 'base64');

    if (data.length < 28) {
      throw new InternalServerError();
    }

    try {
      const decipher: DecipherGCM = createDecipheriv('aes-256-gcm', this.key, data.subarray(0, 12));
      decipher.setAuthTag(data.subarray(data.length - 16));

      return Buffer.concat([decipher.update(data.subarray(12, data.length - 16)), decipher.final()]).toString('utf8');
    } catch {
      throw new InternalServerError();
    }
  }
}
