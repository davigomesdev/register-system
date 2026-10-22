import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Entity } from '../entity.js';

class TestEntity extends Entity<{ name: string }> {
  public constructor(props: { name: string }, id?: bigint) {
    super(props, id);
  }

  public get name(): string {
    return this.props.name;
  }
}

describe('Entity', () => {
  it('should generate snowflake id when not provided', () => {
    const entity = new TestEntity({ name: 'test' });

    assert.equal(typeof entity.id, 'bigint');
    assert.ok(entity.id > 0n);
  });

  it('should use provided id', () => {
    const entity = new TestEntity({ name: 'test' }, 42n);
    assert.equal(entity.id, 42n);
  });

  it('should serialize toJSON with id as string', () => {
    const entity = new TestEntity({ name: 'test' }, 1n);
    const json = entity.toJSON();

    assert.equal(json.id, '1');
    assert.equal(json.name, 'test');
  });
});
