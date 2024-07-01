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
