import { Manager, define, fields } from '@palmares/databases';

export const users = define('users', {
  fields: {
    id: fields.uuid().primaryKey().unique(),
    firstName: fields.char({ maxLen: 255 }),
    lastName: fields.char({ maxLen: 255 }),
    email: fields.text().unique(),
    password: fields.text()
  }
});
