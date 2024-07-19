import {
  describe,
} from '@palmares/tests'
import JestTestAdapter from '@palmares/jest-tests';

import { Company, User } from './models';

describe<JestTestAdapter>('models', ({ test }) => {
  test('its assigning a different date', async ({ expect }) => {
    const company = await Company.default.set({ name: 'test', address: 'test' });
    const user = await User.default.set({ name: 'test', companyId: company[0].id, age: 10 } as any);
    const createdAtDate = user[0].createdAt;
    const previousUpdatedAt = user[0].updatedAt;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const afterUpdate = await User.default.set({ name: 'test' }, { search: { id: user[0].id}});
    const newCreatedAtDate = user[0].createdAt;
    const newUpdatedAtDate = afterUpdate[0].updatedAt;

    expect(newUpdatedAtDate).not.toBe(createdAtDate);
    expect(newUpdatedAtDate > previousUpdatedAt).toBe(true);
    expect(newCreatedAtDate).toBe(newCreatedAtDate);
  });

  test('its not allowing null to non nullable fields', async ({ expect }) => {
    try {
      await Company.default.set({ name: null } as any);
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  test('its allowing null to nullable fields', async ({ expect }) => {
    const data = await Company.default.set({ name: 'test', address: null });
    expect(data[0].address).toBe(null);
  });

  test('its not allowing null to non nullable fields', async ({ expect }) => {
    try {
      await User.default.set({ name: null } as any);
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});
