import { describe } from '@palmares/tests';

import { Company, ProfileType, User } from './models';

import type JestTestAdapter from '@palmares/jest-tests';

describe<JestTestAdapter>('sequelize models', ({ test }) => {
  test('Test set data through relation', async ({ expect }) => {
    const company = await Company.default.set((qs) =>
      qs
        .join(User, 'usersOfCompany', (qs) =>
          qs
            .join(ProfileType, 'profileType', (qs) =>
              qs.data({
                name: 'admin2'
              })
            )
            .data(
              {
                age: 10,
                name: 'test1',
                uuid: 'a417f723-ddb7-4f8c-a42c-0b5975e4cf5f',
                userType: 'admin'
              },
              {
                age: 11,
                name: 'test2',
                uuid: '77ac0c15-09c7-425e-9d77-97c0f973e8e6',
                userType: 'user'
              }
            )
        )
        .data({
          address: 'test',
          name: 'test5'
        })
    );

    const companyId = company[0].id;
    expect(company[0].usersOfCompany[0]?.companyId).toBe(companyId);
    expect(company[0].usersOfCompany[0]?.profileTypeId).toBe(company[0].usersOfCompany[0]?.profileType?.id);
  });

  /*
  test('its working with functions', async ({ expect }) => {
    await Company.default.set({ name: 'test', address: 'test', translatable: 'here'});
    const companies = await Company.test.test('test');
    const value = Company.auth.test();

    expect(companies.length > 0).toBe(true);
    expect(value).toBe('test');
  });

  test('its assigning a different date', async ({ expect }) => {
    const company = await Company.default.set({ name: 'test', address: 'test', translatable: 'here' });
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
    const company = await Company.default.set({ name: 'test2', address: 'hey', translatable: 'here', usersOfCompany: [{
      name: 'test', age: 10, price: 120
    }] }, { includes: [{
      model: User
    }]});

    const user = await User.default.get({  search: { companyId: company[0].id as number }});
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
    const data = await Company.default.set({ name: 'test', address: null, translatable: 'here' });
    expect(data[0].address).toBe(null);
  });*/
});
