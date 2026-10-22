import type { FastifyBaseLogger, FastifyRequest } from 'fastify';

import { ActorTypeEnum } from '#src/domain/enums/actor-type-enum.js';
import { UnauthorizedError } from '#src/domain/errors/unauthorized-error.js';

export type Context = {
  requestId: string | null;
  actorId: bigint | null;
  actorType: ActorTypeEnum;
  ip: string | null;
  userAgent: string | null;
  deviceInfo: string | null;
  log: FastifyBaseLogger;
};

export class ContextFactory {
  public static fromRequest(req: FastifyRequest): Context {
    const hasClaims: boolean = req.claims !== null && req.claims !== undefined;

    return {
      requestId: req.id,
      actorId: hasClaims ? req.claims!.subject : null,
      actorType: hasClaims ? ActorTypeEnum.USER : ActorTypeEnum.SYSTEM,
      ip: req.ip,
      userAgent: req.headers['user-agent'] ?? null,
      deviceInfo: typeof req.headers['x-device-info'] === 'string' ? req.headers['x-device-info'] : null,
      log: req.log,
    };
  }

  public static system(loggerServer: FastifyBaseLogger): Context {
    return {
      requestId: null,
      actorId: null,
      actorType: ActorTypeEnum.SYSTEM,
      ip: null,
      userAgent: null,
      deviceInfo: null,
      log: loggerServer,
    };
  }

  public static getActorId(ctx: Context): bigint {
    if (ctx.actorId === null) {
      throw new UnauthorizedError();
    }

    return ctx.actorId;
  }
}
