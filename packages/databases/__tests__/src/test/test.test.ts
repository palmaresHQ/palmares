import {
  describe,
} from '@palmares/tests'
import JestTestAdapter from '@palmares/jest-tests';

import { Company, User } from './models';

describe<JestTestAdapter>('first test', ({ test }) => {
  test('test', async ({ expect }) => {
    const company = await Company.default.set({ name: 'test', address: 'test' });
    const user = await User.default.set({ name: 'test', companyId: company[0].id, age: 10 });

    await new Promise((resolve) => setTimeout(resolve, 2000));
    await User.default.set({ name: 'test' }, { search: { id: user[0].id}});
  });
});
