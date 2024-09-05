import * as d from 'drizzle-orm/sqlite-core';
import * as pdb from '@palmares/databases';
import * as drzl from 'drizzle-orm';

export const Company = d.sqliteTable('companies', {
  id: d.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }).notNull().unique(),
  name: d.text('name', { length: 255 }).notNull(),
  address: d.text('address', { length: 255 }),
  translatable: d.real('translatable')
}, (table) => ({
  idIdx: d.uniqueIndex('companies_id_idx').on(table.id)
}));

export const User = d.sqliteTable('users', {
  id: d.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }).notNull().unique(),
  uuid: d.text('uuid').notNull().unique().$defaultFn(() => pdb.generateUUID()),
  name: d.text('name', { length: 255 }),
  age: d.integer('age', { mode: 'number' }).notNull(),
  userType: d.text('user_type', { enum: ["admin", "user"] }).default('admin').notNull(),
  price: d.real('price'),
  isActive: d.integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  updatedAt: d.text('updated_at').notNull().$onUpdate(() => drzl.sql`CURRENT_TIMESTAMP`),
  createdAt: d.text('created_at').notNull().$defaultFn(() => drzl.sql`CURRENT_TIMESTAMP`),
  companyId: d.integer('company_id', { mode: 'number' }).notNull().references((): d.AnySQLiteColumn => Company.id)
}, (table) => ({
  idIdx: d.uniqueIndex('users_id_idx').on(table.id),
  nameIdx: d.index('users_name_idx').on(table.name),
  ageIdx: d.index('users_age_idx').on(table.age)
}));

export const UserRelations = drzl.relations(User, (args) => ({
  company: args.one(Company, {
    fields: [User.companyId],
    references: [Company.id]
  })
}));

export const CompanyRelations = drzl.relations(Company, (args) => ({
  usersOfCompany: args.many(User)
}));

