import { CacheAdapterNotImplementedError } from "./exceptions"

export default class CacheAdapter {
  static new(_cacheAdapterConstructor: typeof CacheAdapter, args: any): () => Promise<CacheAdapter> {
    throw new CacheAdapterNotImplementedError({
      className: CacheAdapter.name,
      functionName: 'new'
    })
  }

  async get(_key: string): Promise<any> {
    throw new CacheAdapterNotImplementedError({
      className: CacheAdapter.name,
      functionName: 'get'
    })
  }

  async set(_key: string, _value: any) {
    throw new CacheAdapterNotImplementedError({
      className: CacheAdapter.name,
      functionName: 'set'
    })
  }

  async remove(_key: string) {
    throw new CacheAdapterNotImplementedError({
      className: CacheAdapter.name,
      functionName: 'remove'
    })
  }
}
