import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HashProvider } from '../hash-provider.js';

describe('HashProvider', () => {
  const provider = new HashProvider();

  it('should generate token', () => {
    const token = provider.generateToken();
    assert.equal(typeof token, 'string');
    assert.ok(token.length > 0);
  });

  it('should generate different tokens', () => {
    assert.notEqual(provider.generateToken(), provider.generateToken());
  });

  it('should hash token deterministically', () => {
    const a = provider.hashToken('token', 'secret');
    const b = provider.hashToken('token', 'secret');
    assert.equal(a, b);
    assert.equal(a.length, 64);
  });

  it('should hash and verify password', async () => {
    const hash = await provider.hashPassword('password1');
    assert.equal(typeof hash, 'string');
    assert.equal(await provider.verifyPassword('password1', hash), true);
    assert.equal(await provider.verifyPassword('wrong', hash), false);
  });
});
