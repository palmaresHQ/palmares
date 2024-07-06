export default class TestExpectAdapter {
  toBe(value: any, expected: any, isNot: boolean) {
    throw new Error('Not implemented');
  }

  toEqual(value: any, expected: any, isNot: boolean) {
    throw new Error('Not implemented');
  }

  toStrictEqual(value: any, expected: any, isNot: boolean) {
    throw new Error('Not implemented');
  }

  toBeDefined(value: any, isNot: boolean) {
    throw new Error('Not implemented');
  }

  toBeInstanceOf(value: any, expected: any, isNot: boolean) {
    throw new Error('Not implemented');
  }

  toHaveBeenCalled(value: any, isNot: boolean) {
    throw new Error('Not implemented');
  }

  async toHaveBeenCalledTimes(value: any, isNot: boolean) {
    throw new Error('Not implemented');
  }

  async toHaveBeenCalledWith(value: any, args: any[], isNot: boolean) {
    throw new Error('Not implemented');
  }

  async toHaveReturned(value: (...args: any[]) => any, isNot: boolean) {
    throw new Error('Not implemented');
  }

  async toHaveReturnedTimes(value: any, expected: number, isNot: boolean) {
    throw new Error('Not implemented');
  }
}
