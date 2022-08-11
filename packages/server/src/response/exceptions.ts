export class InvalidCookie extends Error {
  constructor() {
    super(`The cookie should define a name and a value. `+
    `And for an existing cookie the name or the value was not defined.`)
  }
}

export class UseSetCookieInstead extends Error {
  constructor() {
    super(`Looks like you are trying to set the 'set-cookie' header directly, `+
    `please use the 'setCookie()' or 'setManyCookies()' methods instead.`)
  }
}
