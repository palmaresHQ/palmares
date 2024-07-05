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

  toHaveBeenCalled(value: any, isNot: boolean) {
    throw new Error('Not implemented');
  }

  toHaveBeenCalledTimes(value: any, isNot: boolean) {
    throw new Error('Not implemented');
  }

  toHaveBeenCalledWith(value: any, args: any[], isNot: boolean) {
    throw new Error('Not implemented');
  }

  toHaveReturned(value: (...args: any[]) => any, isNot: boolean) {
    throw new Error('Not implemented');
  }

  toHaveReturnedTimes(value: any, expected: number, isNot: boolean) {
    throw new Error('Not implemented');
  }
}
