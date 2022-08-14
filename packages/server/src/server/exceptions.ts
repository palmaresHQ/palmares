export class NotImplementedServerException extends Error {
  constructor(serverName: string, methodName: string) {
    super(`Method '${methodName}' was not implemented in '${serverName}' and it should be implemented in order to fully work.`);
    this.name = NotImplementedServerException.name;
  }
}

export class CannotParsePathParameterException extends Error {
  constructor(path: string, parameter: string) {
    super(`Could not parse path parameter ${parameter} in path ${path}, it should be of the form <label>, <label: string>, or <label: number> or <label: a_regex>`);
    this.name = CannotParsePathParameterException.name;
  }
}
