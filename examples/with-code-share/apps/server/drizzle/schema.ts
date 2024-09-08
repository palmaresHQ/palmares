import * as d from 'drizzle-orm/sqlite-core';
import * as pdb from '@palmares/databases';
import * as drzl from 'drizzle-orm';

export const InventoryItem = d.sqliteTable('inventory_item', {
  id: d.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }).notNull().unique(),
  uuid: d.text('uuid').notNull().unique().$defaultFn(() => pdb.generateUUID()),
  manufacturer: d.text('manufacturer', { enum: ["Apple", "Dell", "HP", "Lenovo"] }).notNull(),
  serial: d.text('serial', { length: 12 }).notNull(),
  status: d.text('status', { enum: ["use", "maintenance", "available"] }).notNull(),
  purchaseDate: d.text('purchaseDate').notNull(),
  warrantyExpiryDate: d.text('warrantyExpiryDate').notNull(),
  specifications: d.text('specifications').notNull(),
  imageUrl: d.text('imageUrl').notNull(),
  assignmentDate: d.text('assignmentDate'),
  userId: d.integer('user_id', { mode: 'number' }).references((): d.AnySQLiteColumn => User.id)
});

export const User = d.sqliteTable('user', {
  id: d.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }).notNull().unique(),
  firstName: d.text('firstName').notNull(),
  lastName: d.text('lastName').notNull(),
  email: d.text('email').notNull()
});

export const InventoryItemRelations = drzl.relations(InventoryItem, (args) => ({
  user: args.one(User, {
    fields: [InventoryItem.userId],
    references: [User.id]
  })
}));

export const UserRelations = drzl.relations(User, (args) => ({
  inventoriesOfUser: args.many(InventoryItem)
}));

