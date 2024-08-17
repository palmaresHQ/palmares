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

export class RedirectionStatusCodesMustHaveALocationHeaderError extends Error {
  constructor() {
    super(
      `Redirection status codes must have a 'Location' header. You can set it by using the 'headers' ` +
        `option when creating a new 'Response' instance. Or just use 'Response.redirect()' method.`
    );
  }
}

export class HandlerOrHandlersShouldBeDefinedOnRouterAdapterError extends Error {
  constructor() {
    super(
      `Either 'parseHandler' or 'parseHandlers' methods/functions should be defined on router adapter.` +
        ` If none of them are defined, the router will not work.`
    );
    this.name = HandlerOrHandlersShouldBeDefinedOnRouterAdapterError.name;
  }
}
