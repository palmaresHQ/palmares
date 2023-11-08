export class NotSpecifiedCacheAdapterError extends Error {
  constructor() {
    super(`Cache adapter should be specified before the cache is called.`);
    this.name = NotSpecifiedCacheAdapterError.name;
  }
}

export class CacheAdapterNotImplementedError extends Error {
  constructor(args: { className: string; functionName: string }) {
    super(`Cache adapter did not implement ${args.className} in ${args.functionName}`);
    this.name = CacheAdapterNotImplementedError.name;
  }
}
