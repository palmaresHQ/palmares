export class DomainObligatoryParamsUndefinedError extends Error {
  constructor() {
    super(`'appName' and 'appPath' should be defined.`)
    this.name = DomainObligatoryParamsUndefinedError.name
  }
}

export class NotAValidDomainDefaultExportedError extends Error {
  constructor() {
    super(`One of your domains does not 'default' export a valid domain.\n`+
    `For example, if you have the domain 'core', you should export 'default' \n` +
    `as 'export default class CoreDomain extends Domain { ... }'`)
    this.name = NotAValidDomainDefaultExportedError.name
  }
}
