import { describe } from '@palmares/tests';
import { inventorySchema, ModelFields } from 'shared';
import { User } from '../auth/models';
import { InventoryItem } from './models';
import { getItemByCursor } from './services';
import { randomUUID } from 'crypto';

export const inventoryTest = (
  getUsers: () => ModelFields<InstanceType<typeof User>>[], 
  getInventories: () => ModelFields<InstanceType<typeof InventoryItem>>[]
) => {
  describe('inventory testing', ({ test }) => {
    test('should fetch inventory and return next cursor', async ({ expect }) => {
      const inventories = getInventories();
      const { data, nextCursor } = await getItemByCursor(inventories[25].id);
      expect(data.length).toBe(20);
      expect(nextCursor).toBe(inventories[5].id);
      
      const lastItem = (await InventoryItem.default.get({ limit: 1, ordering: ['id'] }))[0];
      const { data: data2, nextCursor: nextCursor2 } = await getItemByCursor(lastItem.id);
      expect(data2.length).toBe(0);
      expect(nextCursor2).toBe(null);
    });

    test('should prevent data from saving if id already exists', async ({ expect }) => {
      const inventories = getInventories();

      const copiedData = JSON.parse(JSON.stringify(inventories[0]));
      copiedData.id = 9999;
      copiedData.uuid = randomUUID();
      const validData = await inventorySchema.validate(copiedData, {});

      expect(validData.isValid).toBe(false);
      expect(validData.isValid === false ? validData.errors[0].message : '').toBe('Serial already exists');    
    });

    test('should prevent bad inventory data', async ({ expect }) => {
      const inventories = getInventories();

      const copiedData = JSON.parse(JSON.stringify(inventories[22]));

      copiedData.serial = 'abc';
      const validData = await inventorySchema.validate(copiedData, {});

      expect(validData.isValid).toBe(false);
      expect((validData.isValid === false ? validData.errors[0].message : '').includes(`Serial number is not valid`)).toBe(true);    
    });

    test('should set assignment to null in case of different status than `use`', async ({ expect }) => {
      const inventories = getInventories();
      const users = getUsers();
      
      const copiedData = JSON.parse(JSON.stringify(inventories[23]));

      copiedData.status = 'available';
      copiedData.assignmentDate = new Date().toISOString();
      copiedData.userId = users[25].id;
      const { parsed } = await inventorySchema.parse(copiedData);
      
      expect(parsed.userId).toBe(null);
      expect(parsed.assignmentDate).toBe(null);
    });
  });
}