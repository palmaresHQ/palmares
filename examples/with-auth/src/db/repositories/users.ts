import { users } from '../schemas/users';

import type { InferModel } from '@palmares/databases';

export async function createUser(data: InferModel<typeof users, 'create'>) {
  return await users.default.set((qs) => qs.data(data));
}

export async function getUserByEmail(email: string) {
  return await users.default.get((qs) => qs.where({ email }));
}

export async function getUserById(id: string) {
  return await users.default.get((qs) => qs.where({ id }));
}

export async function updateUser(id: string, data: InferModel<typeof users, 'update'>) {
  return await users.default.set((qs) => qs.where({ id }).data(data));
}

export async function deleteUser(id: string) {
  return await users.default.remove((qs) => qs.where({ id }));
}
