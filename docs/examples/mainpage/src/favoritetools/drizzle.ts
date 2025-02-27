// @ts-nocheck
import { define, fields, Model, ON_DELETE, InferModel } from '@palmares/databases';

import * as schema from './.drizzle.schema';
import { db } from './settings.favoritetools';

export const Company = define('Company', {
  fields: {
    id: fields.auto(),
    name: fields.char({ maxLen: 255 }),
    isActive: fields.bool().default(true)
  },
  options: {
    tableName: 'companies',
    instance: schema.Company
  }
});

export async function createCompanyWithDrizzle() {
  const drizzleCompany = await Company.default.getInstance();

  // You think we are bad developers, which maybe we are.
  //
  // So you are still free to use drizzle directly, like magic!
  await db.insert(drizzleCompany).values({
    id: 1,
    name: 'Evil Foo',
    isActive: true
  });

  db.select().from(Company.default.instance).all();
}
