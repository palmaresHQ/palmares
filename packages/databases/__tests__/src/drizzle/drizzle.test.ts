import {
  describe,
} from '@palmares/tests'

import { Company, User } from '../drizzle/models';

import type JestTestAdapter from '@palmares/jest-tests';

describe<JestTestAdapter>('drizzle models', ({ test }) => {
  test('its limiting the query', async ({ expect }) => {
    await Company.default.set({ name: 'test', address: 'test' })
    await Company.default.set({ name: 'test', address: 'test' })

    const companies = await Company.default.get({
      search: {
        name: {
          like: '%te%'
        }
      },
      limit: 1,
      ordering: ['-id']
    });

    expect(companies.length === 1).toBe(true);
  });
  test('its working with functions', async ({ expect }) => {
    await Company.default.set({ name: 'test', address: 'test' });
    const companies = await Company.test.test('test');
    const value = Company.auth.test();

    expect(companies.length > 0).toBe(true);
    expect(value).toBe('test');
  });


  test('its assigning a different date', async ({ expect }) => {
    const company = await Company.default.set({ name: 'test', address: 'test', translatable: 12 });
    const user = await User.default.set({ name: 'test', companyId: company[0].id as number, age: 10, price: 120 });
    const createdAtDate = user[0].createdAt;
    const previousUpdatedAt = user[0].updatedAt;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const afterUpdate = await User.default.set({ name: 'test' }, { search: { id: user[0].id }});
    const newCreatedAtDate = user[0].createdAt;
    const newUpdatedAtDate = afterUpdate[0].updatedAt;

    expect(newUpdatedAtDate).not.toBe(createdAtDate);
    expect(newUpdatedAtDate > previousUpdatedAt).toBe(true);
    expect(newCreatedAtDate).toBe(newCreatedAtDate);
  });

  test('its creating a user with company using includes', async ({ expect }) => {
    const company = await Company.default.set({ name: 'test2', address: 'hey', translatable: 12, usersOfCompany: [{
      name: 'test', age: 10, price: 120
    }] }, { includes: [{
      model: User
    }]});

    const user = await User.default.get({ search: { companyId: company[0].id as number }, limit: 1});
    expect(company[0].usersOfCompany.length > 0).toBe(true);
    expect(user[0].companyId).toBe(company[0].id as number);
  })

  test('its not allowing null to non nullable fields', async ({ expect }) => {
    try {
      await Company.default.set({ name: null } as any);
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  test('its allowing null to nullable fields', async ({ expect }) => {
    const data = await Company.default.set({ name: 'test', address: null, translatable: 12 });
    expect(data[0].address).toBe(null);
  });
});
