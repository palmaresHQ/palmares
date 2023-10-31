export class SchemaAdapterNotImplementedError extends Error {
  constructor(args: { className: string; functionName: string }) {
    super(`Schema adapter did not implement ${args.functionName} in ${args.className}`);
  }
}
