// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import '../database.config';

import { Company, User } from './models';

/**
 * YOU CAN STILL USE SEQUELIZE!
 *
 * Uncomment the following Lines of Code to query the database from Sequelize.
 */
// import type { SequelizeModel } from '@palmares/sequelize-engine';

(async () => {
  await Company.default.set((qs) =>
    qs
      .join(User, 'usersOfCompany', (qs) =>
        qs.data(
          {
            firstName: 'Foo',
            lastName: 'bar',
            email: 'foo@bar.com'
          },
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@doe.com'
          }
        )
      )
      .data({
        name: 'Evil Foo',
        slug: 'evil-foo',
        isActive: true
      })
  );

  const data = await User.default.get((qs) => qs.join(Company, 'company', (qs) => qs.where({ slug: 'evil-foo' })));

  console.log('All users in your db:', data);

  /**
   * YOU CAN STILL USE SEQUELIZE!
   *
   * Uncomment the following Lines of Code to query the database from Sequelize.
   */
  // const UserFromSequelize = (await User.default.getInstance()) as SequelizeModel<typeof User>;
  // console.log('Data from sequelize:', await UserFromSequelize.findMany()); // IT HAS TYPESAFETY!!!
})();
