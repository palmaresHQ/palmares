export default class TestExpectAdapter {
  toBe(_value: any, _expected: any, _isNot: boolean) {
    throw new Error('Not implemented');
  }

  toEqual(_value: any, _expected: any, _isNot: boolean) {
    throw new Error('Not implemented');
  }

  toStrictEqual(_value: any, _expected: any, _isNot: boolean) {
    throw new Error('Not implemented');
  }

  toBeDefined(_value: any, _isNot: boolean) {
    throw new Error('Not implemented');
  }

  toBeInstanceOf(__value: any, _expected: any, _isNot: boolean) {
    throw new Error('Not implemented');
  }

  toHaveBeenCalled(_value: any, _isNot: boolean) {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line ts/require-await
  async toHaveBeenCalledTimes(_value: any, _isNot: boolean) {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line ts/require-await
  async toHaveBeenCalledWith(_value: any, _args: any[], _isNot: boolean) {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line ts/require-await
  async toHaveReturned(_value: (...args: any[]) => any, _isNot: boolean) {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line ts/require-await
  async toHaveReturnedTimes(_value: any, _expected: number, _isNot: boolean) {
    throw new Error('Not implemented');
  }
}
