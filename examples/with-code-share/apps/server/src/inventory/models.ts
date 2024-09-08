import { AbstractInventoryItem } from '@examples/with-code-share-shared';
import { define, fields, foreignKey } from '@palmares/databases';

import { InventoryItem as DInventoryItem } from '../../drizzle/schema';
import { User } from '../auth/models';

export const InventoryItem = define('InventoryItem', {
  fields: {
    userId: foreignKey({
      allowNull: true,
      relatedTo: User,
      relatedName: 'inventoriesOfUser',
      relationName: 'user',
      toField: 'id',
      onDelete: fields.ON_DELETE.CASCADE
    })
  },
  abstracts: [AbstractInventoryItem],
  options: {
    tableName: 'inventory_item',
    instance: DInventoryItem
  }
});
