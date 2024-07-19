import { describe } from '@palmares/tests'
import JestTestAdapter from '@palmares/jest-tests';

describe<JestTestAdapter>('Olá bruno', ({ test }) => {
  test('Test with bruno', async ({ expect, custom: { jest } }) => {
    const test = {
      myFunction: () => {}
    }

    jest.spyOn(test, 'myFunction').mockImplementation(() => {})
    test.myFunction()
    expect(test.myFunction).toHaveBeenCalled()
  });
});
