// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import '../database.config';

import { Company, User } from './models';

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
})();
