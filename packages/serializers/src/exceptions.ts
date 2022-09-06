export default class ValidationError<M = any> extends Error {
  reason: string;
  description: string;
  meta?: M;

  constructor(error: { reason: string, description: string, meta?: M }) {
    super(error.description);
    this.name = ValidationError.name;
    this.reason = error.reason;
    this.description = error.description;
    this.meta = error.meta;
  }

  get json() {
    return {
      reason: this.reason,
      description: this.description,
      meta: this.meta ? this.meta : {},
    }
  }
}

export class InvalidSerializerSchemaError extends Error {
  constructor() {
    super(`'SERIALIZER_SCHEMA' must be defined in your settings file`);
    this.name = InvalidSerializerSchemaError.name;
  }
}

export class InvalidModelOnModelSerializerError extends Error {
  constructor(serializerName: string, instance: any) {
    super(`The serializer '${serializerName}' does not contain a valid model. Received: ${instance}`);
    this.name = InvalidModelOnModelSerializerError.name;
  }
}

export class FieldSourcesError extends Error {
  constructor(className: string, source: string, instance: any) {
    super(`The source '${source}' defined in '${className}' does not exist in instance: ${JSON.stringify(instance)}`);
    this.name = FieldSourcesError.name;
  }
}

export class SerializerManyAndNotArrayError extends Error {
  constructor(className: string) {
    super(`'many' param should be equal to true in '${className}' serializer`);
    this.name = SerializerManyAndNotArrayError.name;
  }
}

export class SerializerShouldCallIsValidBeforeAccessingData extends Error {
  constructor(className: string) {
    super(
      `You should call 'isValid()' function before accessing the 'validatedData' in '${className}'. Example:\n\n`+
      `const serializer = MyCustomSerializer({ data: requestData });\n`+
      `if (await serializer.isValid()) await serializer.save();`
    );
    this.name = SerializerShouldCallIsValidBeforeAccessingData.name;
  }
}

export class SchemaNotImplementedError extends Error {
  constructor(methodName: string, schemaName: string) {
    super(`Method '${methodName}' was not implemented in '${schemaName}' and it should be implemented in order to fully work.`)
  }
}
