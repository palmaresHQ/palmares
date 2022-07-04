export class DomainObligatoryParamsUndefinedError extends Error {
  constructor() {
    super(`'appName' and 'appPath' should be defined.`)
  }
}