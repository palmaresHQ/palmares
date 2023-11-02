export default class CacheAdapter {
  static new(_cacheAdapterConstructor: typeof CacheAdapter, args: any): () => Promise<CacheAdapter> {
    throw new Error('Method not implemented')
  }

  async get(_key: string): Promise<any> {
    throw new Error('Method not implemented')
  }
}
