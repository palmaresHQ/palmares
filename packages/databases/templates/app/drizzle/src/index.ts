// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import '../database.config';

import { Company, User } from './models';

/**
 * YOU CAN STILL USE DRIZZLE!
 *
 * Uncomment the following Lines of Code to query the database from Drizzle.
 */
// import { db } from '../database.config';
// import * as d from '../.drizzle/schema';

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
   * YOU CAN STILL USE DRIZZLE!
   *
   * Uncomment the following Lines of Code to query the database from Drizzle.
   */
  // const dataFromDrizzle = await db.select().from(d.User)
  // console.log('Hello from Drizzle Users:', dataFromDrizzle);
})();
