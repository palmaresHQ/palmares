import { TestExpectAdapter } from "@palmares/tests";

export default class JestExpectAdapter extends TestExpectAdapter {
  toBe(value: any, expected: any, isNot: boolean) {
    const expect = require('@jest/globals').expect;
    if (isNot) expect(value).not.toBe(expected);
    else expect(value).toBe(expected);
  }

  toEqual(value: any, expected: any, isNot: boolean) {
    const expect = require('@jest/globals').expect;
    if (isNot) expect(value).not.toEqual(expected);
    else expect(value).toEqual(expected);
  }

  toStrictEqual(value: any, expected: any, isNot: boolean): void {
    const expect = require('@jest/globals').expect;
    if (isNot) expect(value).not.toStrictEqual(expected);
    else expect(value).toStrictEqual(expected);
  }

  toHaveBeenCalled(value: any, isNot: boolean): void {
    const expect = require('@jest/globals').expect;
    if (isNot) expect(value).not.toHaveBeenCalled();
    else expect(value).toHaveBeenCalled();
  }

  toHaveBeenCalledTimes(value: any, isNot: boolean): void {
    const expect = require('@jest/globals').expect;
    if (isNot) expect(value).not.toHaveBeenCalledTimes();
    else expect(value).toHaveBeenCalledTimes();
  }

  toHaveBeenCalledWith(value: any, args: any[], isNot: boolean): void {
    const expect = require('@jest/globals').expect;
    if (isNot) expect(value).not.toHaveBeenCalledWith(...args);
    else expect(value).toHaveBeenCalledWith(...args);
  }

  toHaveReturned(value: (...args: any[]) => any, isNot: boolean): void {
    const expect = require('@jest/globals').expect;
    if (isNot) expect(value).not.toHaveReturned();
    else expect(value).toHaveReturned();
  }

  toHaveReturnedTimes(value: any, expected: number, isNot: boolean): void {
    const expect = require('@jest/globals').expect;
    if (isNot) expect(value).not.toHaveReturnedTimes(expected);
    else expect(value).toHaveReturnedTimes(expected);
  }
}
