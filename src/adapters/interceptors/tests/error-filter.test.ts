import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { NotFoundError } from '#src/domain/errors/not-found-error.js';
import { UnauthorizedError } from '#src/domain/errors/unauthorized-error.js';
import { BadRequestError } from '#src/domain/errors/bad-request-error.js';
import { ConflictError } from '#src/domain/errors/conflict-error.js';
import { UnprocessableEntityError } from '#src/domain/errors/unprocessable-entity-error.js';

import { ErrorFilter } from '../error-filter.js';

describe('ErrorFilter', () => {
  function makeReply() {
    const reply = {
      statusCode: 0,
      body: null as unknown,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      send(payload: unknown) {
        this.body = payload;
        return this;
      },
    };
    return reply;
  }

  const req = {
    log: {
      error: mock.fn(),
      warn: mock.fn(),
    },
  };

  it('should map NotFoundError to 404', () => {
    const reply = makeReply();
    ErrorFilter.handle(new NotFoundError('missing') as never, req as never, reply as never);

    assert.equal(reply.statusCode, 404);
    assert.deepEqual((reply.body as { error: { messages: string[] } }).error.messages, ['missing']);
  });

  it('should map UnauthorizedError to 401', () => {
    const reply = makeReply();
    ErrorFilter.handle(new UnauthorizedError() as never, req as never, reply as never);
    assert.equal(reply.statusCode, 401);
  });

  it('should map BadRequestError to 400', () => {
    const reply = makeReply();
    ErrorFilter.handle(new BadRequestError('bad') as never, req as never, reply as never);
    assert.equal(reply.statusCode, 400);
  });

  it('should map ConflictError to 409', () => {
    const reply = makeReply();
    ErrorFilter.handle(new ConflictError('dup') as never, req as never, reply as never);
    assert.equal(reply.statusCode, 409);
  });

  it('should map UnprocessableEntityError to 422', () => {
    const reply = makeReply();
    ErrorFilter.handle(new UnprocessableEntityError(['a', 'b']) as never, req as never, reply as never);
    assert.equal(reply.statusCode, 422);
    assert.deepEqual((reply.body as { error: { messages: string[] } }).error.messages, ['a', 'b']);
  });

  it('should map unknown error to 500', () => {
    const reply = makeReply();
    ErrorFilter.handle(new Error('boom') as never, req as never, reply as never);
    assert.equal(reply.statusCode, 500);
  });

  it('notFound should return 404 route not found', () => {
    const reply = makeReply();
    ErrorFilter.notFound({} as never, reply as never);
    assert.equal(reply.statusCode, 404);
  });
});
