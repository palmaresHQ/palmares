export class NotImplementedServerException extends Error {
  constructor(methodName: string) {
    super(`Method ${methodName} was not implemented in your server, it should be defined in order to fully work.`);
    this.name = NotImplementedServerException.name;
  }
}

export class CannotParsePathParameterException extends Error {
  constructor(path: string, parameter: string) {
    super(`Could not parse path parameter ${parameter} in path ${path}, it should be of the form <label: string>, or <label: number> or <label: a_regex>`);
    this.name = CannotParsePathParameterException.name;
  }
}
