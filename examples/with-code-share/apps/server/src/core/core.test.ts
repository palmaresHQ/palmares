import { describe, beforeAll } from '@palmares/tests';
import { mockInventory, mockUsers, ModelFields } from 'shared';
import { User } from '../auth/models';
import { InventoryItem } from '../inventory/models';
import { inventoryTest } from '../inventory/inventory.test';
import { authTests } from '../auth/auth.test';

describe('start tests', ({ test }) => {
  let users: ModelFields<InstanceType<typeof User>>[] = [];
  let inventories: ModelFields<InstanceType<typeof InventoryItem>>[] = [];

  beforeAll(async () => {  
    await InventoryItem.default.remove({});
    await User.default.remove({});  
    users = await Promise.all(mockUsers(30).rows.map(async (user) => (await User.default.set({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }))[0]));
    inventories = await Promise.all(mockInventory(30, { users: users }).rows.map(async (item) => (await InventoryItem.default.set({ 
      id: item.id,
      uuid: item.uuid,
      manufacturer: item.manufacturer,
      serial: item.serial,
      status: item.status,
      purchaseDate: item.purchaseDate,
      warrantyExpiryDate: item.warrantyExpiryDate,
      assignmentDate: item.assignmentDate,
      specifications: item.specifications,
      imageUrl: item.imageUrl,
      userId: item.userId,
    }))[0]));
  });
  
  authTests(() => users);
  inventoryTest(() => users, () => inventories);

  afterAll(async () => {
    await InventoryItem.default.remove({});
    await User.default.remove({});  
  });
})

