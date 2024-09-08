import { getInventorySchemaWithSave } from '@examples/with-code-share-shared';
import { and, eq, not, sql } from 'drizzle-orm/sql';

import { InventoryItem } from '../../drizzle/schema';
import { db } from '../settings';

export const serverInventorySchema = getInventorySchemaWithSave(async (item) => {
  const existsWithUuid = await db
    .select({
      count: sql<number>`count(*)`
    })
    .from(InventoryItem)
    .where(eq(InventoryItem.uuid, item.uuid));

  if (existsWithUuid[0].count > 0) {
    const data = (
      await db
        .update(InventoryItem)
        .set({
          manufacturer: item.manufacturer,
          serial: item.serial,
          status: item.status,
          purchaseDate: item.purchaseDate instanceof Date ? item.purchaseDate.toISOString() : item.purchaseDate,
          warrantyExpiryDate:
            item.warrantyExpiryDate instanceof Date ? item.warrantyExpiryDate.toISOString() : item.warrantyExpiryDate,
          specifications: item.specifications,
          imageUrl: item.imageUrl,
          assignmentDate: item.assignmentDate instanceof Date ? item.assignmentDate.toISOString() : item.assignmentDate,
          userId: item.userId
        })
        .where(eq(InventoryItem.uuid, item.uuid))
        .returning()
    )[0];
    return data;
  } else {
    return (
      await db
        .insert(InventoryItem)
        .values({
          uuid: item.uuid,
          manufacturer: item.manufacturer,
          serial: item.serial,
          status: item.status,
          purchaseDate: item.purchaseDate instanceof Date ? item.purchaseDate.toISOString() : item.purchaseDate,
          warrantyExpiryDate:
            item.warrantyExpiryDate instanceof Date ? item.warrantyExpiryDate.toISOString() : item.warrantyExpiryDate,
          specifications: item.specifications,
          imageUrl: item.imageUrl,
          assignmentDate: item.assignmentDate instanceof Date ? item.assignmentDate.toISOString() : item.assignmentDate,
          userId: item.userId
        })
        .returning()
    )[0];
  }
}).refine(async (item) => {
  if (item) {
    const existsWithSerial = await db
      .select({
        count: sql<number>`count(*)`
      })
      .from(InventoryItem)
      .where(and(eq(InventoryItem.serial, item.serial), not(eq(InventoryItem.uuid, item.uuid))));

    if (existsWithSerial[0].count > 0) return { code: 'serial', message: 'Serial already exists' };
  }
});
