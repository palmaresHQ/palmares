export class SchemaAdapterNotImplementedError extends Error {
  constructor(args: { className: string; functionName: string }) {
    super(`Schema adapter did not implement ${args.functionName} in ${args.className}`);
  }
}

export class NoAdapterFoundError extends Error {
  constructor() {
    super('No adapter found');
  }
}
