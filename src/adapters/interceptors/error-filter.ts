import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

import { STATUS_CODES } from 'node:http';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';

import { ConflictError } from '#src/domain/errors/conflict-error.js';
import { NotFoundError } from '#src/domain/errors/not-found-error.js';
import { BadRequestError } from '#src/domain/errors/bad-request-error.js';
import { UnauthorizedError } from '#src/domain/errors/unauthorized-error.js';
import { UnprocessableEntityError } from '#src/domain/errors/unprocessable-entity-error.js';

export class ErrorFilter {
  public static handle(error: FastifyError, req: FastifyRequest, reply: FastifyReply): FastifyReply {
    let status: number = 500;
    let messages: string[] = ['internal server error'];

    switch (true) {
      case hasZodFastifySchemaValidationErrors(error):
        status = 422;
        messages = error.validation.map(({ instancePath, message }): string => {
          const field: string = instancePath
            .replace(/^\/(filter|options)(?=\/|$)/, '')
            .replace(/^\//, '')
            .replace(/\//g, '.');

          const text: string = message ?? 'invalid value';
          return field ? `${field}: ${text}` : text;
        });
        break;

      case error instanceof UnprocessableEntityError:
        status = 422;
        messages = error.messages;
        break;

      case error instanceof BadRequestError:
        status = 400;
        messages = [error.message];
        break;

      case error instanceof UnauthorizedError:
        status = 401;
        messages = [error.message];
        break;

      case error instanceof NotFoundError:
        status = 404;
        messages = [error.message];
        break;

      case error instanceof ConflictError:
        status = 409;
        messages = [error.message];
        break;

      case error.statusCode !== undefined && error.statusCode >= 400 && error.statusCode < 500:
        status = error.statusCode as number;
        messages = [error.message];
        break;
    }

    if (status >= 500) {
      req.log.error({ err: error }, 'internal server error');
    } else {
      req.log.warn(messages.join(', '));
    }

    return reply.status(status).send({
      error: {
        code: status,
        type: (STATUS_CODES[status] ?? 'internal server error').toUpperCase().replace(/ /g, '_'),
        messages,
      },
    });
  }

  public static notFound(_req: FastifyRequest, reply: FastifyReply): FastifyReply {
    return reply.status(404).send({
      error: {
        code: 404,
        type: 'NOT_FOUND',
        messages: ['route not found'],
      },
    });
  }
}
