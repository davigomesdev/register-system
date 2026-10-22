import type { IEnvService } from '#src/infra/env/env-service.js';
import type { JWTVerifyResult } from 'jose';

import { SignJWT, jwtVerify } from 'jose';

import { UnauthorizedError } from '#src/domain/errors/unauthorized-error.js';
import { InternalServerError } from '#src/domain/errors/internal-server-error.js';

const LEEWAY_SECS: number = 5;
const TOKEN_EXPIRY_SECS: number = 15 * 60;

export type JwtClaims = {
  subject: bigint;
  issuer: string;
  accessLevel: string | null;
  expiresAt: number;
  issuedAt: number;
};

export interface IJwtService {
  getClaims(token: string, issuer: string): Promise<JwtClaims>;
  createToken(subject: bigint, issuer: string, accessLevel: string | null, now: number): Promise<string>;
}

export class JwtService implements IJwtService {
  private readonly secret: Uint8Array;

  public constructor(envService: IEnvService) {
    this.secret = new TextEncoder().encode(envService.getJWTSecretKey());
  }

  public async getClaims(token: string, issuer: string): Promise<JwtClaims> {
    try {
      const { payload }: JWTVerifyResult = await jwtVerify(token, this.secret, {
        algorithms: ['HS256'],
        issuer,
        clockTolerance: LEEWAY_SECS,
        requiredClaims: ['sub', 'iss', 'exp', 'iat'],
      });

      return {
        subject: BigInt(payload.sub as string),
        issuer: payload.iss as string,
        accessLevel: typeof payload.access_level === 'string' ? payload.access_level : null,
        expiresAt: payload.exp as number,
        issuedAt: payload.iat as number,
      };
    } catch {
      throw new UnauthorizedError();
    }
  }

  public async createToken(subject: bigint, issuer: string, accessLevel: string | null, now: number): Promise<string> {
    try {
      return await new SignJWT({ access_level: accessLevel })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(subject.toString())
        .setIssuer(issuer)
        .setIssuedAt(now)
        .setExpirationTime(now + TOKEN_EXPIRY_SECS)
        .sign(this.secret);
    } catch {
      throw new InternalServerError();
    }
  }
}
