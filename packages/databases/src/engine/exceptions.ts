export class NotImplementedEngineException extends Error {
  constructor(methodName: string) {
    super(
      `Method ${methodName} was not implemented in your engine, it should be in order to fully work.`
    );
    this.name = NotImplementedEngineException.name;
  }
}

export class NotImplementedEngineFieldsException extends Error {
  constructor(methodName: string) {
    super(
      `Method ${methodName} was not implemented in your engine fields and it ` +
        `should be implemented in order to work properly.`
    );
    this.name = NotImplementedEngineFieldsException.name;
  }
}

export class RelatedModelFromForeignKeyIsNotFromEngineException extends Error {
  constructor(
    engineName: string,
    modelName: string,
    foreignKeyFieldName: string,
    foreignKeyFieldModelName: string,
    fieldName: string
  ) {
    super(
      `The related model '${modelName}' from the foreign key field '${foreignKeyFieldName}' of the model '${foreignKeyFieldModelName}' is not from the engine '${engineName}' that is ` +
        `being used. This is not a problem, but you need to make sure that the field '${fieldName}' it is relating to exists on the model '${modelName}' it is related to.`
    );
    this.name = RelatedModelFromForeignKeyIsNotFromEngineException.name;
  }
}

export class EngineDoesNotSupportFieldTypeException extends Error {
  constructor(engineName: string, fieldType: string) {
    super(
      `The engine '${engineName}' does not support the field of type: '${fieldType}'. If you are using a custom field, make sure that you are using the 'TranslatableField' class.`
    );
    this.name = EngineDoesNotSupportFieldTypeException.name;
  }
}

export class UnmanagedModelsShouldImplementSpecialMethodsException extends Error {
  constructor(modelName: string, methodItShouldImplement: string) {
    super(
      `The model '${modelName}' is unmanaged, so it should implement the '${methodItShouldImplement}' method in order to work properly in queries.`
    );
    this.name = UnmanagedModelsShouldImplementSpecialMethodsException.name;
  }
}
