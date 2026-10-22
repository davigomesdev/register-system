import { Snowflake } from '@sapphire/snowflake';

const snowflake: Snowflake = new Snowflake(new Date('2026-01-01T00:00:00.000Z'));

export abstract class Entity<T> {
  private readonly _id: bigint;
  protected readonly props: T;

  protected constructor(props: T, id?: bigint) {
    this.props = props;
    this._id = id ?? snowflake.generate();
  }

  public get id(): bigint {
    return this._id;
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this._id.toString(),
      ...this.props,
    };
  }
}
