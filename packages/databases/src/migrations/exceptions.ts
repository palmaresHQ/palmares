export class DefaultDuplicateFunctionNotCalledOnEngine extends Error {
  constructor() {
    super('Default duplicate function was not called by engine.');
    this.name = DefaultDuplicateFunctionNotCalledOnEngine.name;
  }
}
