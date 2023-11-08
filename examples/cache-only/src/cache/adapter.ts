import CacheAdapter from "packages/cache/src/adapter";

export class CacheAdapterImpl extends CacheAdapter {
  state = {} as {[key: string]: any}
  set(_key: string, _value: any): Promise<void> {
    return new Promise(res => {
      this.state[_key] = _value
      res()
    })
  }
  get(_key: string): Promise<any> {
    return new Promise(res => res(this.state[_key]))
  }
}
