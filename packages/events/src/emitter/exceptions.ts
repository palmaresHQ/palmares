export class NotImplementedServerException extends Error {
  constructor(serverName: string, methodName: string) {
    super(
      `Method '${methodName}' was not implemented in '${serverName}' and it should be implemented in order to fully work.`
    );
    this.name = NotImplementedServerException.name;
  }
}
