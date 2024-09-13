export class InvalidDefaultValueForFieldType extends Error {
  constructor(fieldName: string, defaultValue: any, shouldBeOfType: string) {
    super(`Invalid default value for field ${fieldName}: ${defaultValue}\nShould be of type ${shouldBeOfType}`);
    this.name = 'InvalidDefaultValueForFieldType';
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
