export class ModelNoUniqueFieldsError extends Error {
  constructor(modelName: string) {
    super(`Model ${modelName} has no unique fields, it should have at least one unique field for `);
    this.name = ModelNoUniqueFieldsError.name;
  }
}

export class ModelCircularAbstractError extends Error {
  constructor(originalModelName: string, abstractModelName: string) {
    super(`Model ${originalModelName} have a circular abstract dependency with ${abstractModelName}`);
  }
}

export class ModelInvalidAbstractFieldError extends Error {
  constructor(modelName: string, abstractModelName: string, fieldName: string) {
    super(
      `The abstract model ${abstractModelName} already have a field named ${fieldName}, ` +
        `please rename the field ${fieldName} in the ${modelName} model`
    );
  }
}

export class ModelInvalidAbstractManagerError extends Error {
  constructor(modelName: string, abstractModelName: string, managerName: string) {
    super(
      `The abstract model ${abstractModelName} already have a manager named ${managerName}, ` +
        `please rename the field ${managerName} in the ${modelName} model`
    );
    this.name = ModelInvalidAbstractManagerError.name;
  }
}

export class ManagerEngineInstanceNotFoundError extends Error {
  constructor(engineName: string) {
    super(
      `The engine ${engineName} is not found in the manager. Make sure that this model is available for that engine.`
    );
    this.name = ManagerEngineInstanceNotFoundError.name;
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
