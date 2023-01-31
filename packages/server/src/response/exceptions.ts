export class InvalidCookie extends Error {
  constructor() {
    super(
      `The cookie should define a name and a value. ` +
        `And for an existing cookie the name or the value was not defined.`
    );
    this.name = InvalidCookie.name;
  }
}

export class UseSetCookieInstead extends Error {
  constructor() {
    super(
      `Looks like you are trying to set the 'set-cookie' header directly, ` +
        `please use the 'setCookie()' or 'setManyCookies()' methods instead.`
    );
    this.name = UseSetCookieInstead.name;
  }
}

export class UseSetBodyInstead extends Error {
  constructor() {
    super(`Set the body by calling 'response.body = newBody' is not supported, if you want to change
    the contents of the body use 'response.setBody(newBody)' method instead`);
    this.name = UseSetBodyInstead.name;
  }
}

export class DoNotCallResponseDirectly extends Error {
  constructor() {
    super(
      `Do not call the Response constructor directly, instead call the 'new' factory method. Example: Response.new(<your_args>)`
    );
  }
}
