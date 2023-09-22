export class AbortedRequestError extends Error {
  constructor(reason?: string) {
    super(reason);
    this.name = 'AbortedRequestError';
  }
}
