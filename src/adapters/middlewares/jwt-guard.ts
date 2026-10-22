import type { SubjectTypeEnum } from '#src/domain/enums/subject-type-enum.js';
import type { IJwtService, JwtClaims } from '#src/infra/jwt/jwt-service.js';
import type { FastifyRequest, onRequestAsyncHookHandler } from 'fastify';

import { ForbiddenError } from '#src/domain/errors/forbidden-error.js';
import { UnauthorizedError } from '#src/domain/errors/unauthorized-error.js';

declare module 'fastify' {
  interface FastifyRequest {
    claims: JwtClaims | null;
  }
}

export class JwtGuard {
  private readonly jwtService: IJwtService;
  private readonly subjectType: SubjectTypeEnum;
  private readonly accessLevels: string[];

  public constructor(jwtService: IJwtService, subjectType: SubjectTypeEnum, accessLevels: string[] = []) {
    this.jwtService = jwtService;
    this.subjectType = subjectType;
    this.accessLevels = accessLevels;
  }

  public handle: onRequestAsyncHookHandler = async (req: FastifyRequest): Promise<void> => {
    const header: string | undefined = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError();
    }

    const claims: JwtClaims = await this.jwtService.getClaims(header.slice(7), this.subjectType);

    if (this.accessLevels.length > 0 && (claims.accessLevel === null || !this.accessLevels.includes(claims.accessLevel))) {
      throw new ForbiddenError();
    }

    req.claims = claims;
  };
}
