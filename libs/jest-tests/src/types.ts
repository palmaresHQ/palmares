/* eslint-disable ts/consistent-type-imports */
export type CustomData = {
  expect: (typeof import('@jest/globals'))['expect'];
  describe: (typeof import('@jest/globals'))['describe'];
  beforeAll: (typeof import('@jest/globals'))['beforeAll'];
  beforeEach: (typeof import('@jest/globals'))['beforeEach'];
  afterEach: (typeof import('@jest/globals'))['afterEach'];
  afterAll: (typeof import('@jest/globals'))['afterAll'];
  test: (typeof import('@jest/globals'))['test'];
  jest: (typeof import('@jest/globals'))['jest'];
};
