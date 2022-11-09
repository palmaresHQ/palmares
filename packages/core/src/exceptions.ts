export class NotImplementedException extends Error {
  constructor(className: string, methodName: string) {
    super(`The '${methodName}' was not implemented in '${className}' class`);
  }
}
