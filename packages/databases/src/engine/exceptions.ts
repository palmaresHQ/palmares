export class NotImplementedEngineException extends Error {
  constructor(methodName: string) {
    super(`Method ${methodName} was not implemented in your engine, it should be in order to fully work.`);
    this.name = NotImplementedEngineException.name;
  }
}

export class NotImplementedEngineFieldsException extends Error {
  constructor(methodName: string) {
    super(`Method ${methodName} was not implemented in your engine fields and it ` +
      `should be implemented in order to work properly.`);
    this.name = NotImplementedEngineFieldsException.name;
  }
}
