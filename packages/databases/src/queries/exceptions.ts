export class UnmanagedModelsShouldImplementSpecialMethodsException extends Error {
  constructor(modelName: string, methodItShouldImplement: string) {
    super(
      `The model '${modelName}' is unmanaged, so it should implement the '${methodItShouldImplement}' +
      ' method in order to work properly in queries.`
    );
    this.name = UnmanagedModelsShouldImplementSpecialMethodsException.name;
  }
}
