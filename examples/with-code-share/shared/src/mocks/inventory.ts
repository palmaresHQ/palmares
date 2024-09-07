import { faker } from "@faker-js/faker";
import { ArrayInventoryOutput } from "../schemas";
import { ModelFields } from "@palmares/databases";
import { AbstractUser } from "../models";
import { regexForManufacturer } from '../utils';


export default function mockInventory(limit: number, options?: {
  offset?: number,
  users?: ModelFields<AbstractUser>[]
}): { rows: ArrayInventoryOutput, nextOffset: number } {
  const offset = typeof options?.offset === 'number' ? options.offset : 0;
  const rows = new Array(limit)
    .fill(0)
    .map((_, i) => {
      const status = faker.helpers.arrayElement(["use", "maintenance", "available"] as const);
      const manufacturer = faker.helpers.arrayElement(["Apple", "Dell", "HP", "Lenovo"] as const);
      const fortyFiveDaysAhead = new Date();
      fortyFiveDaysAhead.setDate(fortyFiveDaysAhead.getDate() + 45);
      const ten10Ago = new Date();
      ten10Ago.setDate(ten10Ago.getDate() - 10);
      const user = faker.helpers.arrayElement(options?.users ?? [{ 
        firstName: faker.person.firstName(), 
        lastName: faker.person.lastName(), 
        email: faker.internet.email(),
        id: 1 
      }])
      return {
        id: i + offset,
        manufacturer: manufacturer,
        uuid: faker.string.uuid(),
        serial: faker.helpers.fromRegExp(new RegExp(regexForManufacturer[manufacturer].replace(/^\^/g, '').replace(/\$$/g, ''))),
        status: status,
        purchaseDate: faker.date.recent().toISOString(),
        warrantyExpiryDate:faker.date.between({ from: ten10Ago, to: fortyFiveDaysAhead }).toISOString(),
        specifications: faker.lorem.sentence(),
        assignmentDate: status !== "use" ? null : faker.date.recent().toISOString(),
        imageUrl: faker.image.url(),
        userId: status !== "use" ? null : user.id,
        user: status !== "use" ? null : {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      } satisfies ArrayInventoryOutput[number]
  });

  return { rows, nextOffset: offset + 1 }
}
  