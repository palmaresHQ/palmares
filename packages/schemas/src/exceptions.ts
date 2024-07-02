export class SchemaAdapterNotImplementedError extends Error {
  constructor(args: { className: string; functionName: string }) {
    super(`Schema adapter did not implement ${args.functionName} in ${args.className}`);
  }
}

export class NoAdapterFoundError extends Error {
  constructor() {
    super('No adapter found, please define an adapter using setDefaultAdapter() before using any schema.');
  }
}

export class TranslatableFieldNotImplementedError extends Error {
  constructor(fieldName: string) {
    super(`TranslatableField '${fieldName}' did not implement the 'schema' key on 'customAttributes'`);
  }
}

export class NotInModelSchemaError extends Error {
  constructor() {
    super(`This schema does not have a 'modelSchema' parent`);
  }
}
