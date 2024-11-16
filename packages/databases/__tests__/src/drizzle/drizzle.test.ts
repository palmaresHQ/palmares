/* eslint-disable ts/naming-convention */
import { describe } from '@palmares/tests';

import { Company, ProfileType, User } from '../drizzle/models';

//const test = require('@jest/globals').test;
describe('drizzle models', ({ test }) => {
  test('Simple query with relation', async ({ expect }) => {
    const company = await Company.default.get((qs) =>
      qs.join(User, 'usersOfCompany', (qs) =>
        qs.join(ProfileType, 'profileType', (qs) =>
          qs.where({
            id: 1
          })
        )
      )
    );
    const teste = company[0].usersOfCompany[0].profileType?.name;
    //const anotherUser = await User.default.get((qs) => qs.where({ name: 'test1' }));
    //console.log(JSON.stringify(user, null, 2), JSON.stringify(anotherUser, null, 2));
    //expect(user.length > 0).toBe(true);
    //expect(user[0].company2.name).toBe('test5');
    //expect(user[0].profileType.name).toBe('admin');
  });

  /*
  test('Simple Set', async ({ expect }) => {
    const company = await Company.default.set((qs) =>
      qs.data({
        address: 'test',
        name: 'test5'
      })
    );

    console.log(JSON.stringify(company, null, 2));
    const companyId = company[0].id;
    //expect(company[0].usersOfCompany[0]?.companyId).toBe(companyId);
    //expect(company[0].usersOfCompany[0]?.profileTypeId).toBe(company[0].usersOfCompany[0]?.profileType?.id);
  });*/

  /*
  test('Querying by selecting fields', async ({ expect }) => {
    const company = await Company.default.get((qs) =>
      qs
        .join(User, 'usersOfCompany', (qs) =>
          qs.select('name', 'uuid', 'age').join(Company, 'company', (qs) => qs.select('name', 'uuid', 'address'))
        )
        .where({ id: 1 })
    );
    console.log(JSON.stringify(company, null, 2));
  });*/

  /*
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

  test('Set update on relation', async ({ expect }) => {
    const company = await Company.default.set((qs) =>
      qs
        .join(User, 'usersOfCompany', (qs) =>
          qs
            .join(ProfileType, 'profileType', (qs) =>
              qs
                .where({
                  id: 1
                })
                .data({
                  name: 'admin2'
                })
            )
            .data({
              name: 'hello'
            })
        )
        .data({
          name: 'hello'
        })
    );

    const companyId = company[0].id;
    expect(company[0].usersOfCompany[0]?.companyId).toBe(companyId);
    expect(company[0].usersOfCompany[0]?.profileTypeId).toBe(company[0].usersOfCompany[0]?.profileType?.id);
  });

  /*
  test('Test Remove', async ({ expect }) => {
    const company = await Company.default.remove((qs) =>
      qs
        .join(User, 'usersOfCompany', (qs) =>
          qs
            .join(ProfileType, 'profileType', (qs) =>
              qs.where({
                id: 5
              })
            )
            .remove()
        )
        .remove()
    );

    console.log(JSON.stringify(company, null, 2));
    const companyId = company[0].id;

    expect(company[0].usersOfCompany[0].companyId).toBe(companyId);
    expect(company[0].usersOfCompany[0].profileTypeId).toBe(company[0].usersOfCompany[0].profileType?.id);
  });
*/
  /*test('its limiting the query', async ({ expect }) => {
    await Company.default.set((qs) => qs.data({ id: undefined, name: 'test', address: 'test' }))
    await Company.default.set((qs) => qs.data({ id: undefined, name: 'test', address: 'test' }))

    const companies = await Company.default.get((qs) =>
      qs
        .where({
          name: {
            like: '%te%'??
          }
        })
      .limit(1)
      .orderBy(['-id'])
  );

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
    const user = await User.default.get((qs) => qs.where({ companyId: company[0].id as number }).limit(1));

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
  });*/
});
