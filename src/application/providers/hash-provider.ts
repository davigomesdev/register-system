import argon2 from 'argon2';
import { createHmac, randomBytes } from 'node:crypto';

export class HashProvider {
  public generateToken(bytes: number = 32): string {
    return randomBytes(bytes).toString('base64url');
  }

  public hashToken(token: string, secret: string): string {
    return createHmac('sha256', secret).update(token).digest('hex');
  }

  public async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  public async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return argon2.verify(passwordHash, password);
  }
}
