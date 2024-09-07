import { describe } from '@palmares/tests';
import { ModelFields } from 'shared';
import { User } from '../auth/models';
import { getUsersByCursorAndSearch } from './services';


export const authTests = (getUsers: () => ModelFields<InstanceType<typeof User>>[]) => {
  describe('auth testing', ({ test }) => {
    test('should fetch users and return next cursor and be able to search', async ({ expect }) => {
      const users = getUsers();
      const { data, nextCursor } = await getUsersByCursorAndSearch(users[27].id);
      expect(data.length).toBe(27);
      expect(nextCursor).toBe(users[0].id);
      
      const lastItem = (await User.default.get({ limit: 1, ordering: ['id'] }))[0];
      const { data: data2, nextCursor: nextCursor2 } = await getUsersByCursorAndSearch(lastItem.id);
      expect(data2.length).toBe(0);
      expect(nextCursor2).toBe(null);

      const { data: data3 } = await getUsersByCursorAndSearch(undefined, users[25].firstName);
      expect(data3.find((user) => user.id === users[25].id)?.id).toBe(users[25].id);
    });

  })
}