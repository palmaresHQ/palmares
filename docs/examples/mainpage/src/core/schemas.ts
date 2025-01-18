// @ts-nocheck
import * as p from '@palmares/schemas';

export const userSchema = p
  .object({
    name: p.string(),
    age: p.number().omit()
  })
  .onSave(async (data) => {
    console.log(`Saving the user ${data.name} with age ${data.age} to the database`);
    return data;
  });

export function validateUser(data: p.infer<typeof userSchema>) {
  const validationResp = await userSchema.validate({ name: 'John', age: 30 }, {});
  if (!validationResp.isValid) {
    throw new Error(`Invalid Data ${validationResp.errors}`);
  }
  const data = await validationResp.save();

  console.log('Age is ommited, check the type', data.age);
  console.log('Just name is returned', data.name);
}
