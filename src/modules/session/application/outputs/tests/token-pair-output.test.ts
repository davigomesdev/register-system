import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { TokenPairOutputMapper } from '../token-pair-output.js';

describe('TokenPairOutputMapper', () => {
  it('should map tokens to output', () => {
    const output = TokenPairOutputMapper.toOutput('access-token', 'refresh-token');

    assert.equal(output.accessToken, 'access-token');
    assert.equal(output.refreshToken, 'refresh-token');
  });
});
