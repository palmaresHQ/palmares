import { describe } from '@palmares/tests';
import JestTestAdapter from '@palmares/jest-tests';

describe<JestTestAdapter>('Basic server tests', ({ test }) => {
  test('test a basic request', async ({ expect }) => {
    fetch('http://localhost:4000')
  })
})
