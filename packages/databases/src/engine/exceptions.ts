export class NotImplementedAdapterException extends Error {
  constructor(methodName: string) {
    super(`Method ${methodName} was not implemented in your Adapter, it should be in order to fully work.`);
    this.name = NotImplementedAdapterException.name;
  }
}

export class NotImplementedAdapterFieldsException extends Error {
  constructor(methodName: string) {
    super(
      `Method ${methodName} was not implemented in your Adapter fields and it ` +
        `should be implemented in order to work properly.`
    );
    this.name = NotImplementedAdapterFieldsException.name;
  }
}
