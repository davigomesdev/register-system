import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { NotFoundError } from '../not-found-error.js';
import { UnauthorizedError } from '../unauthorized-error.js';
import { BadRequestError } from '../bad-request-error.js';
import { ConflictError } from '../conflict-error.js';
import { ForbiddenError } from '../forbidden-error.js';
import { DatabaseError } from '../database-error.js';
import { InternalServerError } from '../internal-server-error.js';
import { UnprocessableEntityError } from '../unprocessable-entity-error.js';

describe('Domain errors', () => {
  it('NotFoundError', () => {
    const error = new NotFoundError('user not found');
    assert.equal(error.name, 'NotFoundError');
    assert.equal(error.message, 'user not found');
  });

  it('UnauthorizedError', () => {
    const error = new UnauthorizedError();
    assert.equal(error.name, 'UnauthorizedError');
    assert.equal(error.message, 'unauthorized');
  });

  it('BadRequestError', () => {
    const error = new BadRequestError('invalid');
    assert.equal(error.name, 'BadRequestError');
    assert.equal(error.message, 'invalid');
  });

  it('ConflictError', () => {
    const error = new ConflictError('already exists');
    assert.equal(error.name, 'ConflictError');
  });

  it('ForbiddenError', () => {
    const error = new ForbiddenError();
    assert.equal(error.name, 'ForbiddenError');
    assert.equal(error.message, 'forbidden');
  });

  it('DatabaseError', () => {
    const error = new DatabaseError('query failed');
    assert.equal(error.name, 'DatabaseError');
  });

  it('InternalServerError', () => {
    const error = new InternalServerError();
    assert.equal(error.name, 'InternalServerError');
  });

  it('UnprocessableEntityError with string', () => {
    const error = new UnprocessableEntityError('bad field');
    assert.equal(error.name, 'UnprocessableEntityError');
    assert.deepEqual(error.messages, ['bad field']);
  });

  it('UnprocessableEntityError with array', () => {
    const error = new UnprocessableEntityError(['a', 'b']);
    assert.deepEqual(error.messages, ['a', 'b']);
    assert.equal(error.message, 'a, b');
  });
});
