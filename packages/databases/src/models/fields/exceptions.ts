export class InvalidDefaultValueForFieldType extends Error {
  constructor(fieldName: string, defaultValue: any, shouldBeOfType: string) {
    super(`Invalid default value for field ${fieldName}: ${defaultValue}\nShould be of type ${shouldBeOfType}`);
    this.name = 'InvalidDefaultValueForFieldType';
  }
}

export class ForeignKeyFieldRelatedOrRelationNameAlreadyExistsError extends Error {
  constructor(
    modelName: string,
    fieldName: string,
    relatedOrRelationName: string,
    otherFieldName: string,
    otherModelName: string,
    isRelatedName: boolean
  ) {
    super(
      `The ForeignKeyField with name '${fieldName}' on model '${modelName}' has a ` +
        `${isRelatedName ? 'relatedName' : 'relationName'} '${relatedOrRelationName}' ` +
        `that already exists for the field '${otherFieldName}' on model '${otherModelName}'. ` +
        `Please, provide a different value.`
    );
    this.name = 'ForeignKeyFieldRelatedNameAlreadyExistsError';
  }
}

export class ForeignKeyFieldInvalidRelatedToError extends Error {
  constructor(fieldName: string, modelName: string) {
    super(
      `Foreign key field ${fieldName} on model ${modelName} has invalid 'relatedTo' parameter. It should ` +
        `relate to a model, a function that returns a model or a string`
    );
    this.name = 'ForeignKeyFieldInvalidRelatedToError';
  }
}

export class ForeignKeyFieldRequiredParamsMissingError extends Error {
  constructor(fieldName: string) {
    super(
      `Foreign key field ${fieldName} requires a reference to a model with ` + `'relatedTo' and 'onDelete' parameter`
    );
    this.name = 'ForeignKeyFieldRequiredParamsMissingError';
  }
}
