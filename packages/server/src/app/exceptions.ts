export class ServerAlreadyInitializedError extends Error {
  constructor() {
    super('Server was already initialized');
  }
}

export class ResponseNotReturnedFromResponseOnMiddlewareError extends Error {
  constructor() {
    super(`Response was not returned from '.response()' method on middleware.`);
  }
}
