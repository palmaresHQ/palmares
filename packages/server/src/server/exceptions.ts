export class NotImplementedServerException extends Error {
  constructor(methodName: string) {
    super(`Method ${methodName} was not implemented in your server, it should be defined in order to fully work.`);
    this.name = NotImplementedServerException.name;
  }
}
