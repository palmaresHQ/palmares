import { Model, ON_DELETE, define, fields } from '@palmares/databases';

import type { InferModel } from '@palmares/databases';

export class Company extends Model<Company>() {
  fields = {
    id: fields.auto(),
    name: fields.char({ maxLen: 255 }),
    isActive: fields.bool().default(true)
  };
}

export const User = define('User', {
  fields: {
    id: fields.auto(),
    firstName: fields.char({ maxLen: 255 }),
    email: fields.text().allowNull(),
    companyId: fields.foreignKey({
      relatedTo: () => Company,
      toField: 'id',
      relationName: 'company',
      relatedName: 'usersOfCompany',
      onDelete: ON_DELETE.CASCADE
    })
  }
});

export async function createUser(data: InferModel<Company, 'create'>) {
  await Company.default.set((qs) =>
    qs
      .join(User, 'usersOfCompany', (qs) =>
        qs.data(
          {
            firstName: 'Foo',
            email: 'foo@bar.com'
          },
          {
            firstName: 'John',
            email: 'john@doe.com'
          }
        )
      )
      .data({
        name: 'Evil Foo',
        isActive: true
      })
  );
}
