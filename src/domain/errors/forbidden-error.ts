export class ForbiddenError extends Error {
  public constructor() {
    super('forbidden');
    this.name = 'ForbiddenError';
  }
}
