export class InternalServerError extends Error {
  public constructor() {
    super('internal server error');
    this.name = 'InternalServerError';
  }
}
