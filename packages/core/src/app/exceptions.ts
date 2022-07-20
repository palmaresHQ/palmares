export class AdapterNotFoundException extends Error {
  constructor(adapter: string) {
    super(`Adapter ${adapter} could not be found`);
  }
}

export class NotAValidAdapterException extends Error {
  constructor(adapter: string) {
    super(`The adapter '${adapter}' is not valid. It should default export an Adapter class.`);
    this.name = NotAValidAdapterException.name;
  }
}
