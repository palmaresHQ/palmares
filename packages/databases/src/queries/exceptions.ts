export class UnmanagedModelsShouldImplementSpecialMethodsException extends Error {
  constructor(modelName: string, methodItShouldImplement: string) {
    super(
      `The model '${modelName}' is unmanaged, so it should implement the '${methodItShouldImplement}' +
      ' method in order to work properly in queries.`
    );
    this.name = UnmanagedModelsShouldImplementSpecialMethodsException.name;
  }
}

export class RelationNameIsNotPartOfModelException extends Error {
  constructor(modelName: string, relationName: string) {
    super(`The relation name '${relationName}' is not part of the model '${modelName}'.`);
    this.name = RelationNameIsNotPartOfModelException.name;
  }
}
