export class UnprocessableEntityError extends Error {
  public readonly messages: string[];

  public constructor(message: string | string[]) {
    super(Array.isArray(message) ? message.join(', ') : message);

    this.name = 'UnprocessableEntityError';
    this.messages = Array.isArray(message) ? message : [message];
  }
}
